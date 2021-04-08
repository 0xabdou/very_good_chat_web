import Conversation from "../types/conversation";
import Message from "../types/message";
import {IChatAPI, SendMessageInput} from "./sources/chat-api";
import {Either, left, right} from "fp-ts/Either";
import ChatError from "../types/chat-error";
import {isApolloError} from "@apollo/client";
import {Observable} from "@apollo/client/utilities/observables/Observable";

export interface IChatRepository {
  getConversations(): Promise<Either<ChatError, Conversation[]>>;

  getOrCreateOTOConversation(userID: string): Promise<Either<ChatError, Conversation>>;

  sendMessage(input: SendMessageInput): Promise<Either<ChatError, Message>>;

  subscribeToMessages(): Observable<Message>;
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

  sendMessage(input: SendMessageInput): Promise<Either<ChatError, Message>> {
    return this._leftOrRight(() => this._chatAPI.sendMessage(input));
  }

  subscribeToMessages(): Observable<Message> {
    return this._chatAPI.subscribeToMessages();
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
      }
      return left(ChatError.general);
    }
  }
}