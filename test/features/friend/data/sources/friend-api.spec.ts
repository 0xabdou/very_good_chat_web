import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import FriendAPI
  from "../../../../../src/features/friend/data/sources/friend-api";
import {GetFriendshipInfo} from "../../../../../src/_generated/GetFriendshipInfo";
import {
  mockFriendRequests,
  mockFriendship,
  mockFriendshipInfo,
  mockGQLFriendshipInfo
} from "../../../../mock-objects";
import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  CANCEL_FRIEND_REQUEST_MUTATION,
  DECLINE_FRIEND_REQUEST_MUTATION,
  GET_FRIEND_REQUESTS,
  GET_FRIENDSHIP_INFO_QUERY,
  SEND_FRIEND_REQUEST_MUTATION,
  UNFRIEND_MUTATION
} from "../../../../../src/features/friend/data/graphql";
import {SendFriendRequest} from "../../../../../src/_generated/SendFriendRequest";
import {AcceptFriendRequest} from "../../../../../src/_generated/AcceptFriendRequest";
import {DeclineFriendRequest} from "../../../../../src/_generated/DeclineFriendRequest";
import {CancelFriendRequest} from "../../../../../src/_generated/CancelFriendRequest";
import {Unfriend} from "../../../../../src/_generated/Unfriend";
import {GetUserArgs} from "../../../../../src/features/user/types/user";
import {GetFriendRequests} from "../../../../../src/_generated/GetFriendRequests";
import {
  FriendRequest,
  FriendRequests
} from "../../../../../src/features/friend/types/friend-request";

const MockApolloClient = mock<ApolloClient<any>>();
const friendAPI = new FriendAPI(instance(MockApolloClient));
const userID = 'userIDDDD';

describe('getFriendRequests', () => {
  it('should return friend requests', async () => {
    // arrange
    const sentReq = mockFriendRequests.sent[0];
    const receivedReq = mockFriendRequests.received[0];
    const mockResponse: GetFriendRequests = {
      getFriendRequests: {
        __typename: 'FriendRequests',
        received: [
          {
            __typename: 'FriendRequest',
            user: {
              __typename: 'User',
              id: receivedReq.user.id,
              username: receivedReq.user.username,
              name: receivedReq.user.name,
              photoURLSource: receivedReq.user.photo?.source ?? null,
              photoURLMedium: receivedReq.user.photo?.medium ?? null,
              photoURLSmall: receivedReq.user.photo?.small ?? null,
            },
            date: receivedReq.date
          }
        ],
        sent: [
          {
            __typename: 'FriendRequest',
            user: {
              __typename: 'User',
              id: sentReq.user.id,
              username: sentReq.user.username,
              name: sentReq.user.name,
              photoURLSource: sentReq.user.photo?.source ?? null,
              photoURLMedium: sentReq.user.photo?.medium ?? null,
              photoURLSmall: sentReq.user.photo?.small ?? null,
            },
            date: sentReq.date
          }
        ]
      }
    };
    when(MockApolloClient.query(anything())).thenResolve({
      data: mockResponse
    } as unknown as ApolloQueryResult<GetFriendRequests>);
    // act
    const result = await friendAPI.getFriendRequests();
    // assert
    expect(result).toStrictEqual(mockFriendRequests);
    verify(MockApolloClient.query(deepEqual({
      query: GET_FRIEND_REQUESTS,
      fetchPolicy: 'no-cache'
    }))).once();
  });
});

describe('getFriendshipInfo', () => {
  it('should return the friendship info', async () => {
    // arrange
    when(MockApolloClient.query(anything())).thenResolve({
      data: {getFriendshipInfo: mockGQLFriendshipInfo}
    } as unknown as ApolloQueryResult<GetFriendshipInfo>);
    const args: GetUserArgs = {
      username: 'sssssssss',
      userID: 'ddddddddddd'
    };
    // act
    const result = await friendAPI.getFriendshipInfo(args);
    // assert
    expect(result).toMatchObject(mockFriendshipInfo);
    verify(MockApolloClient.query(deepEqual({
      query: GET_FRIENDSHIP_INFO_QUERY,
      variables: args,
      fetchPolicy: 'no-cache',
    }))).once();
  });
});

describe('sendFriendRequest', () => {
  it('should send a friend request and return a friendship', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {
        sendFriendRequest: {
          __typename: 'Friendship',
          ...mockFriendship
        }
      }
    } as ApolloQueryResult<SendFriendRequest>);
    // act
    const result = await friendAPI.sendFriendRequest(userID);
    // assert
    expect(result).toMatchObject(mockFriendship);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: SEND_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    }))).once();
  });
});

describe('acceptFriendRequest', () => {
  it('should accept the friend request and return a friendship', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {
        acceptFriendRequest: {
          __typename: 'Friendship',
          ...mockFriendship
        }
      }
    } as ApolloQueryResult<AcceptFriendRequest>);
    // act
    const result = await friendAPI.acceptFriendRequest(userID);
    // assert
    expect(result).toMatchObject(mockFriendship);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    }))).once();
  });
});

describe('declineFriendRequest', () => {
  it('should decline the friend request and return a friendship', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {
        declineFriendRequest: {
          __typename: 'Friendship',
          ...mockFriendship
        }
      }
    } as ApolloQueryResult<DeclineFriendRequest>);
    // act
    const result = await friendAPI.declineFriendRequest(userID);
    // assert
    expect(result).toMatchObject(mockFriendship);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: DECLINE_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    }))).once();
  });
});

describe('cancelFriendRequest', () => {
  it('should cancel the friend request and return a friendship', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {
        cancelFriendRequest: {
          __typename: 'Friendship',
          ...mockFriendship
        }
      }
    } as ApolloQueryResult<CancelFriendRequest>);
    // act
    const result = await friendAPI.cancelFriendRequest(userID);
    // assert
    expect(result).toMatchObject(mockFriendship);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: CANCEL_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    }))).once();
  });
});

describe('unfriend', () => {
  it('should unfriend and return a friendship', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {
        unfriend: {
          __typename: 'Friendship',
          ...mockFriendship
        }
      }
    } as ApolloQueryResult<Unfriend>);
    // act
    const result = await friendAPI.unfriend(userID);
    // assert
    expect(result).toMatchObject(mockFriendship);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: UNFRIEND_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    }))).once();
  });
});