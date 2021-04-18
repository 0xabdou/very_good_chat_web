import Conversation from "../types/conversation";
import Message, {MessageSub} from "../types/message";
import {IChatAPI, SendMessageInput} from "./sources/chat-api";
import {Either, left, right} from "fp-ts/Either";
import ChatError from "../types/chat-error";
import {isApolloError} from "@apollo/client";
import {Observable} from "@apollo/client/utilities/observables/Observable";
import Typing, {TypingInput} from "../types/typing";

export interface IChatRepository {
  getConversations(): Promise<Either<ChatError, Conversation[]>>;

  getOrCreateOTOConversation(userID: string): Promise<Either<ChatError, Conversation>>;

  getMoreMessages(conversationID: number, messageID: number): Promise<Either<ChatError, Message[]>>;

  typing(input: TypingInput): Promise<Either<ChatError, null>>;

  sendMessage(input: SendMessageInput): Promise<Either<ChatError, Message>>;

  messagesDelivered(conversationIDs: number[]): Promise<Either<ChatError, number>>;

  messagesSeen(conversationID: number): Promise<Either<ChatError, number>>;

  subscribeToMessages(): Observable<MessageSub>;

  subscribeToTypings(): Observable<Typing>;
}

export default class ChatRepository implements IChatRepository {
  private readonly _chatAPI: IChatAPI;

  constructor(chatAPI: IChatAPI) {
    this._chatAPI = chatAPI;
  }

  getConversations(): Promise<Either<ChatError, Conversation[]>> {
    return this._leftOrRight(() => this._chatAPI.getConversations());
  }

  getOrCreateOTOConversation(userID: string): Promise<Either<ChatError, Conversation>> {
    return this._leftOrRight(() => this._chatAPI.getOrCreateOTOConversation(userID));
  }

  getMoreMessages(conversationID: number, messageID: number): Promise<Either<ChatError, Message[]>> {
    return this._leftOrRight(() => this._chatAPI.getMoreMessages(conversationID, messageID));
  }

  typing(input: TypingInput): Promise<Either<ChatError, null>> {
    return this._leftOrRight(() => this._chatAPI.typing(input));
  }

  sendMessage(input: SendMessageInput): Promise<Either<ChatError, Message>> {
    return this._leftOrRight(() => this._chatAPI.sendMessage(input));
  }

  messagesDelivered(conversationIDs: number[]): Promise<Either<ChatError, number>> {
    return this._leftOrRight(() => this._chatAPI.messagesDelivered(conversationIDs));
  }

  messagesSeen(conversationID: number): Promise<Either<ChatError, number>> {
    return this._leftOrRight(() => this._chatAPI.messagesSeen(conversationID));
  }

  subscribeToMessages(): Observable<MessageSub> {
    return this._chatAPI.subscribeToMessages();
  }

  subscribeToTypings(): Observable<Typing> {
    return this._chatAPI.subscribeToTypings();
  }

  async _leftOrRight<R>(work: () => Promise<R>): Promise<Either<ChatError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log('ChatRepo THREW: ', e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(ChatError.network);
        }
        if (code == "BLOCKED") return left(ChatError.blocked);
        if (code == "BLOCKING") return left(ChatError.blocking);
      }
      return left(ChatError.general);
    }
  }
}