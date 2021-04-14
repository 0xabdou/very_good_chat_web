import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult, FetchResult} from "@apollo/client";
import ChatAPI, {MESSAGES_PER_FETCH} from "../../../../../src/features/chat/data/sources/chat-api";
import {
  GetConversations,
  GetConversations_getConversations,
  GetConversations_getConversations_messages
} from "../../../../../src/_generated/GetConversations";
import Observable from "zen-observable";
import {
  mockConversation,
  mockGQLConversation,
  mockGQLMedia,
  mockGQLMessage,
  mockMedia,
  mockMessage,
  mockSendMessageInput
} from "../../../../mock-objects";
import {
  GET_CONVERSATIONS,
  GET_MORE_MESSAGES,
  GET_OR_CREATE_OTO_CONVERSATION,
  MESSAGES_DELIVERED,
  SEND_MESSAGE,
  SUBSCRIBE_TO_MESSAGES
} from "../../../../../src/features/chat/data/graphql";
import {GetOrCreateOTOConversation} from "../../../../../src/_generated/GetOrCreateOTOConversation";
import {SendMessage} from "../../../../../src/_generated/SendMessage";
import {
  MessagesDelivered,
  MessagesDeliveredVariables
} from "../../../../../src/_generated/MessagesDelivered";
import {SubscribeToMessages} from "../../../../../src/_generated/SubscribeToMessages";
import {MessageSub} from "../../../../../src/features/chat/types/message";
import {
  GetMoreMessages,
  GetMoreMessagesVariables
} from "../../../../../src/_generated/GetMoreMessages";
import Conversation, {UsersLastSeen} from "../../../../../src/features/chat/types/conversation";

const MockApolloClient = mock<ApolloClient<any>>();

const chatAPI = new ChatAPI(instance(MockApolloClient));

describe('parsing', () => {
  describe('parseConversation', () => {
    test(`with less that ${MESSAGES_PER_FETCH} messages`, () => {
      // act
      const result = ChatAPI.parseConversation(mockGQLConversation);
      // assert
      expect(result).toStrictEqual(mockConversation);
    });

    test(`with more that ${MESSAGES_PER_FETCH} messages`, () => {
      // act
      const input: GetConversations_getConversations = {
        ...mockGQLConversation,
        messages: Array.from(
          {length: MESSAGES_PER_FETCH},
          (_, idx): GetConversations_getConversations_messages => ({
            ...mockGQLMessage,
            id: idx
          })
        )
      };
      const seenDates: UsersLastSeen = {};
      mockGQLConversation.participants.forEach(p => {
        seenDates[p.id] = 0;
      });
      const output: Conversation = {
        ...mockConversation,
        messages: input.messages.map(ChatAPI.parseMessage),
        hasMore: true,
        seenDates,
      };
      const result = ChatAPI.parseConversation(input);
      // assert
      expect(result).toStrictEqual(output);
    });
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

describe("getMoreMessages", () => {
  it('should get more messages', async () => {
    // arrange
    when(MockApolloClient.query(anything())).thenResolve({
      data: {getMoreMessages: [mockGQLMessage]}
    } as ApolloQueryResult<GetMoreMessages>);
    const convID = 1, msgID = 2;
    // act
    const result = await chatAPI.getMoreMessages(convID, msgID);
    // assert
    expect(result).toStrictEqual([mockMessage]);
    verify(MockApolloClient.query<GetMoreMessages, GetMoreMessagesVariables>(deepEqual({
      query: GET_MORE_MESSAGES,
      variables: {conversationID: convID, messageID: msgID},
      fetchPolicy: "no-cache"
    }))).once();
  });
});

describe('sendMessage', () => {
  it('should send a message', async () => {
    /// arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {sendMessage: mockGQLMessage}
    } as ApolloQueryResult<SendMessage>);

    // act
    const result = await chatAPI.sendMessage(mockSendMessageInput);
    // assert
    expect(result).toStrictEqual(mockMessage);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: SEND_MESSAGE,
      variables: {message: mockSendMessageInput}
    }))).once();
  });
});

describe('messagesDelivered', () => {
  it('should call the right api', async () => {
    // arrange
    const messagesDelivered = 123243;
    const conversationIDs = [1, 2, 3];
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {messagesDelivered}
    } as ApolloQueryResult<MessagesDelivered>);
    // act
    const result = await chatAPI.messagesDelivered(conversationIDs);
    // assert
    expect(result).toBe(messagesDelivered);
    verify(MockApolloClient.mutate<MessagesDelivered, MessagesDeliveredVariables>(deepEqual({
      mutation: MESSAGES_DELIVERED,
      variables: {conversationIDs}
    }))).once();
  });
});

describe('subscribeToMessages', () => {
  type STMFR = FetchResult<SubscribeToMessages>;
  it('should subscribe to messages', () => {
    // arrange
    const r1 = {
      data: {
        messages: {
          __typename: 'MessageSub',
          message: mockGQLMessage,
          update: true
        }
      }
    } as STMFR;
    const r2 = {
      data: {messages: {__typename: 'MessageSub', message: mockGQLMessage}}
    } as STMFR;
    const values = [r1, r2];
    const observable = Observable.of<STMFR>(...values);
    when(MockApolloClient.subscribe(anything())).thenReturn(observable);
    // act
    const result = chatAPI.subscribeToMessages();
    // assert
    let i = 0;
    result.forEach(m => {
      const messageSub: MessageSub = {
        message: ChatAPI.parseMessage(values[i].data!.messages.message),
        update: values[i].data!.messages.update ?? undefined
      };
      expect(m).toStrictEqual(messageSub);
      i++;
    });
    verify(MockApolloClient.subscribe(deepEqual({
      query: SUBSCRIBE_TO_MESSAGES,
      fetchPolicy: 'no-cache'
    }))).once();
  });
});