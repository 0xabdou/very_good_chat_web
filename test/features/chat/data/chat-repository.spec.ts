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
  mockSendMessageInput
} from "../../../mock-objects";

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
