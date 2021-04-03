import Conversation from "../../types/conversation";
import Message from "../../types/message";
import {ApolloClient} from "@apollo/client";
import {
  GetConversations,
  GetConversations_getConversations
} from "../../../../_generated/GetConversations";
import {
  GET_CONVERSATIONS,
  GET_OR_CREATE_OTO_CONVERSATION,
  SEND_MESSAGE
} from "../graphql";
import {UserAPI} from "../../../user/data/sources/user-api";
import {ConversationType} from "../../../../_generated/globalTypes";
import {
  SendMessage,
  SendMessage_sendMessage,
  SendMessage_sendMessage_medias,
  SendMessageVariables
} from "../../../../_generated/SendMessage";
import {Media, MediaType} from "../../types/media";
import {
  GetOrCreateOTOConversation,
  GetOrCreateOTOConversationVariables
} from "../../../../_generated/GetOrCreateOTOConversation";

export interface IChatAPI {
  getConversations(): Promise<Conversation[]>;

  getOrCreateOTOConversation(userID: string): Promise<Conversation>;

  sendMessage(input: SendMessageInput): Promise<Message>;
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

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const {data} = await this._client.mutate<SendMessage, SendMessageVariables>({
      mutation: SEND_MESSAGE,
      variables: {message: input}
    });
    return ChatAPI.parseMessage(data?.sendMessage!);
  }

  static parseConversation(conversation: GetConversations_getConversations): Conversation {
    return {
      id: conversation.id,
      participants: conversation.participants.map(UserAPI.parseUser),
      messages: conversation.messages.map(ChatAPI.parseMessage),
      type: ConversationType[conversation.type]
    };
  }

  static parseMessage(message: SendMessage_sendMessage): Message {
    return {
      id: message.id,
      conversationID: message.conversationID,
      senderID: message.senderID,
      text: message.text ?? undefined,
      medias: message.medias?.map(ChatAPI.parseMedia),
      sentAt: message.sentAt,
    };
  }

  static parseMedia(media: SendMessage_sendMessage_medias): Media {
    return {
      url: media.url,
      type: MediaType[media.type]
    };
  }
}

export type SendMessageInput = {
  conversationID: number,
  text?: string,
  medias?: File[]
}