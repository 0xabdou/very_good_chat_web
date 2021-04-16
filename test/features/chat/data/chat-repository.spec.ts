import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {IChatAPI} from "../../../../src/features/chat/data/sources/chat-api";
import ChatRepository from "../../../../src/features/chat/data/chat-repository";
import {expect, it} from "@jest/globals";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import ChatError from "../../../../src/features/chat/types/chat-error";
import {
  mockConversation,
  mockMessage,
  mockSendMessageInput,
  mockTyping,
  mockTypingInput
} from "../../../mock-objects";
import Observable from "zen-observable";
import {MessageSub} from "../../../../src/features/chat/types/message";
import Typing from "../../../../src/features/chat/types/typing";

const MockChatAPI = mock<IChatAPI>();

const chatRepo = new ChatRepository(instance(MockChatAPI));

beforeEach(() => {
  reset(MockChatAPI);
});

describe('error catching', () => {
  const act = (error: Error) => {
    return chatRepo._leftOrRight(() => {
      throw error;
    });
  };

  it('should return network errors', async () => {
    // arrange
    const networkError = new ApolloError({errorMessage: 'LOL'});
    // act
    const result = await act(networkError);
    // assert
    expect(result).toStrictEqual(left(ChatError.network));
  });

  it('should return general errors', async () => {
    // arrange
    const generalError = new Error('LMAO');
    // act
    const result = await act(generalError);
    // assert
    expect(result).toStrictEqual(left(ChatError.general));
  });
});

describe('getConversations', () => {
  it('should return conversations', async () => {
    // arrange
    when(MockChatAPI.getConversations()).thenResolve([mockConversation]);
    // act
    const result = await chatRepo.getConversations();
    // assert
    expect(result).toStrictEqual(right([mockConversation]));
    verify(MockChatAPI.getConversations()).once();
  });
});

describe('getOrCreateOTOConversation', () => {
  it('should return a conversation', async () => {
    // arrange
    const userID = 'userIDDDDd';
    when(MockChatAPI.getOrCreateOTOConversation(anything())).thenResolve(mockConversation);
    // act
    const result = await chatRepo.getOrCreateOTOConversation(userID);
    // assert
    expect(result).toStrictEqual(right(mockConversation));
    verify(MockChatAPI.getOrCreateOTOConversation(userID)).once();
  });
});

describe('getMoreMessages', () => {
  it('should get more messages', async () => {
    // arrange
    const convID = 123, msgID = 3265;
    when(MockChatAPI.getMoreMessages(anything(), anything())).thenResolve([mockMessage]);
    // act
    const result = await chatRepo.getMoreMessages(convID, msgID);
    // assert
    expect(result).toStrictEqual(right([mockMessage]));
    verify(MockChatAPI.getMoreMessages(convID, msgID)).once();
  });
});

describe('typing', () => {
  it("should do what it is fated to do", async () => {
    // arrange
    when(MockChatAPI.typing(anything())).thenResolve(null);
    // act
    const result = await chatRepo.typing(mockTypingInput);
    // assert
    expect(result).toStrictEqual(right(null));
    verify(MockChatAPI.typing(mockTypingInput)).once();
  });
});

describe('sendMessage', () => {
  it('should return a message', async () => {
    // arrange
    when(MockChatAPI.sendMessage(anything())).thenResolve(mockMessage);
    // act
    const result = await chatRepo.sendMessage(mockSendMessageInput);
    // assert
    expect(result).toStrictEqual(right(mockMessage));
    verify(MockChatAPI.sendMessage(mockSendMessageInput)).once();
  });
});

describe('messagesDelivered', () => {
  it('should return a number', async () => {
    // arrange
    const messagesDelivered = 12314;
    const ids = [12312, 123, 123123];
    when(MockChatAPI.messagesDelivered(anything())).thenResolve(messagesDelivered);
    // act
    const result = await chatRepo.messagesDelivered(ids);
    // assert
    expect(result).toStrictEqual(right(messagesDelivered));
    verify(MockChatAPI.messagesDelivered(ids)).once();
  });
});

describe('subscribeToMessages', () => {
  // arrange
  const observable = Observable.of<MessageSub>({message: mockMessage});
  when(MockChatAPI.subscribeToMessages()).thenReturn(observable);
  // act
  const result = chatRepo.subscribeToMessages();
  // assert
  verify(MockChatAPI.subscribeToMessages()).once();
  expect(result).toBe(observable);
});

describe('subscribeToTypings', () => {
  // arrange
  const observable = Observable.of<Typing>(mockTyping);
  when(MockChatAPI.subscribeToTypings()).thenReturn(observable);
  // act
  const result = chatRepo.subscribeToTypings();
  // assert
  verify(MockChatAPI.subscribeToTypings()).once();
  expect(result).toBe(observable);
});