import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import ChatAPI, {SendMessageInput} from "../../../../../src/features/chat/data/sources/chat-api";
import {
  mockConversation,
  mockGQLConversation,
  mockGQLMedia,
  mockGQLMessage,
  mockMedia,
  mockMessage
} from "../../../../mock-objects";
import {GetConversations} from "../../../../../src/_generated/GetConversations";
import {
  GET_CONVERSATIONS,
  GET_OR_CREATE_OTO_CONVERSATION,
  SEND_MESSAGE
} from "../../../../../src/features/chat/data/graphql";
import {GetOrCreateOTOConversation} from "../../../../../src/_generated/GetOrCreateOTOConversation";
import {SendMessage} from "../../../../../src/_generated/SendMessage";

const MockApolloClient = mock<ApolloClient<any>>();

const chatAPI = new ChatAPI(instance(MockApolloClient));

describe('parsing', () => {
  test('parseConversation', () => {
    // act
    const result = ChatAPI.parseConversation(mockGQLConversation);
    // assert
    expect(result).toStrictEqual(mockConversation);
  });
  test('parseMessage', () => {
    // act
    const result = ChatAPI.parseMessage(mockGQLMessage);
    // assert
    expect(result).toStrictEqual(mockMessage);
  });
  test('parseMedia', () => {
    // act
    const result = ChatAPI.parseMedia(mockGQLMedia);
    // assert
    expect(result).toStrictEqual(mockMedia);
  });
});

describe('getConversations', () => {
  it('should get conversations', async () => {
    // arrange
    when(MockApolloClient.query(anything())).thenResolve({
      data: {getConversations: [mockGQLConversation]}
    } as ApolloQueryResult<GetConversations>);
    // act
    const result = await chatAPI.getConversations();
    // assert
    expect(result).toStrictEqual([mockConversation]);
    verify(MockApolloClient.query(deepEqual({query: GET_CONVERSATIONS}))).once();
  });
});

describe('getOrCreateOTOConversation', () => {
  it('should get/create a OTO conversation', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {getOrCreateOneToOneConversation: mockGQLConversation}
    } as ApolloQueryResult<GetOrCreateOTOConversation>);
    const userID = 'userIDDDDD';
    // act
    const result = await chatAPI.getOrCreateOTOConversation(userID);
    // assert
    expect(result).toStrictEqual(mockConversation);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: GET_OR_CREATE_OTO_CONVERSATION,
      variables: {userID}
    }))).once();
  });
});

describe('sendMessage', () => {
  it('should send a message', async () => {
    /// arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {sendMessage: mockGQLMessage}
    } as ApolloQueryResult<SendMessage>);
    const sendMessageInput: SendMessageInput = {
      conversationID: 911,
      text: 'Hello world',
      medias: [new File(['1', '2', '3'], "viva l'Algerie")]
    };
    // act
    const result = await chatAPI.sendMessage(sendMessageInput);
    // assert
    expect(result).toStrictEqual(mockMessage);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: SEND_MESSAGE,
      variables: {message: sendMessageInput}
    }))).once();
  });
});