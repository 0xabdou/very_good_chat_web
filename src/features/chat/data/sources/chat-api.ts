import Conversation, {UsersLastSeen} from "../../types/conversation";
import Message, {Delivery, MessageSub} from "../../types/message";
import {ApolloClient} from "@apollo/client";
import {
  GetConversations,
  GetConversations_getConversations
} from "../../../../_generated/GetConversations";
import {
  GET_CONVERSATIONS,
  GET_MORE_MESSAGES,
  GET_OR_CREATE_OTO_CONVERSATION,
  MESSAGES_DELIVERED,
  MESSAGES_SEEN,
  SEND_MESSAGE,
  SUBSCRIBE_TO_MESSAGES
} from "../graphql";
import {UserAPI} from "../../../user/data/sources/user-api";
import {ConversationType} from "../../../../_generated/globalTypes";
import {
  SendMessage,
  SendMessage_sendMessage,
  SendMessage_sendMessage_deliveredTo,
  SendMessage_sendMessage_medias,
  SendMessageVariables
} from "../../../../_generated/SendMessage";
import {Media, MediaType} from "../../types/media";
import {
  GetOrCreateOTOConversation,
  GetOrCreateOTOConversationVariables
} from "../../../../_generated/GetOrCreateOTOConversation";
import {SubscribeToMessages} from "../../../../_generated/SubscribeToMessages";
import {Observable} from "@apollo/client/utilities/observables/Observable";
import {
  MessagesDelivered,
  MessagesDeliveredVariables
} from "../../../../_generated/MessagesDelivered";
import {
  MessagesSeen,
  MessagesSeenVariables
} from "../../../../_generated/MessagesSeen";
import {
  GetMoreMessages,
  GetMoreMessagesVariables
} from "../../../../_generated/GetMoreMessages";

export interface IChatAPI {
  getConversations(): Promise<Conversation[]>;

  getOrCreateOTOConversation(userID: string): Promise<Conversation>;

  getMoreMessages(conversationID: number, messageID: number): Promise<Message[]>;

  sendMessage(input: SendMessageInput): Promise<Message>;

  messagesDelivered(conversationIDs: number[]): Promise<number>;

  messagesSeen(conversationID: number): Promise<number>;

  subscribeToMessages(): Observable<MessageSub>;
}

export default class ChatAPI implements IChatAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async getConversations(): Promise<Conversation[]> {
    const {data} = await this._client.query<GetConversations>({
      query: GET_CONVERSATIONS
    });
    return data.getConversations.map(ChatAPI.parseConversation);
  }

  async getOrCreateOTOConversation(userID: string): Promise<Conversation> {
    const {data} = await this._client.mutate<GetOrCreateOTOConversation, GetOrCreateOTOConversationVariables>({
      mutation: GET_OR_CREATE_OTO_CONVERSATION,
      variables: {userID}
    });
    return ChatAPI.parseConversation(data?.getOrCreateOneToOneConversation!);
  }

  static parseConversation(conv: GetConversations_getConversations): Conversation {
    const seenDates: UsersLastSeen = {};
    let pIDs: string[] = [];
    conv.participants.forEach(p => {
      seenDates[p.id] = 0;
      pIDs.push(p.id);
    });
    let mIdx = conv.messages.length - 1;
    while (mIdx >= 0 && pIDs.length) {
      const message = conv.messages[mIdx];
      for (let seenBy of message.seenBy) {
        if (pIDs.indexOf(seenBy.userID) != -1) {
          seenDates[seenBy.userID] = seenBy.date;
          pIDs = pIDs.filter(id => id != seenBy.userID);
        }
      }
      mIdx--;
    }
    return {
      id: conv.id,
      participants: conv.participants.map(UserAPI.parseUser),
      messages: conv.messages.map(ChatAPI.parseMessage),
      type: ConversationType[conv.type],
      seenDates,
      hasMore: conv.messages.length == 30,
    };
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const {data} = await this._client.mutate<SendMessage, SendMessageVariables>({
      mutation: SEND_MESSAGE,
      variables: {message: input}
    });
    return ChatAPI.parseMessage(data?.sendMessage!);
  }

  async messagesDelivered(conversationIDs: number[]): Promise<number> {
    const {data} = await this._client.mutate<MessagesDelivered, MessagesDeliveredVariables>({
      mutation: MESSAGES_DELIVERED,
      variables: {conversationIDs}
    });
    return data?.messagesDelivered!;
  }

  async getMoreMessages(conversationID: number, messageID: number): Promise<Message[]> {
    const {data} = await this._client.mutate<GetMoreMessages, GetMoreMessagesVariables>({
      mutation: GET_MORE_MESSAGES,
      variables: {conversationID, messageID}
    });
    return data!.getMoreMessages!.map(ChatAPI.parseMessage);
  }

  subscribeToMessages(): Observable<MessageSub> {
    const sub = this._client.subscribe<SubscribeToMessages>({
      query: SUBSCRIBE_TO_MESSAGES,
      fetchPolicy: 'no-cache'
    });
    return sub
      .filter(({data}) => Boolean(data?.messages))
      .map(({data}) => {
        return {
          message: ChatAPI.parseMessage(data!.messages.message),
          update: data!.messages.update ?? undefined
        };
      });
  }

  async messagesSeen(conversationID: number): Promise<number> {
    const {data} = await this._client.mutate<MessagesSeen, MessagesSeenVariables>({
      mutation: MESSAGES_SEEN,
      variables: {conversationID}
    });
    return data?.messagesSeen!;
  }

  static parseMessage(message: SendMessage_sendMessage): Message {
    return {
      id: message.id,
      conversationID: message.conversationID,
      senderID: message.senderID,
      text: message.text ?? undefined,
      medias: message.medias?.map(ChatAPI.parseMedia),
      sentAt: message.sentAt,
      deliveredTo: message.deliveredTo.map(ChatAPI.parseDelivery),
      seenBy: message.seenBy.map(ChatAPI.parseDelivery),
      sent: true
    };
  }

  static parseMedia(media: SendMessage_sendMessage_medias): Media {
    return {
      url: media.url,
      thumbUrl: media.thumbUrl ?? undefined,
      type: MediaType[media.type]
    };
  }

  static parseDelivery(delivery: SendMessage_sendMessage_deliveredTo): Delivery {
    return {userID: delivery.userID, date: delivery.date};
  }
}

export type SendMessageInput = {
  conversationID: number,
  text?: string,
  medias?: File[]
}