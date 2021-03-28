import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";
import {IFriendAPI} from "../../../../src/features/friend/data/sources/friend-api";
import FriendRepository, {friendErrors} from "../../../../src/features/friend/data/friend-repository";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import FriendError from "../../../../src/features/friend/types/friend-error";
import {
  getApolloError,
  mockFriend,
  mockFriendRequests,
  mockFriendship,
  mockFriendshipInfo
} from "../../../mock-objects";
import {GetUserArgs} from "../../../../src/features/user/types/user";

const MockFriendAPI = mock<IFriendAPI>();
const friendRepo = new FriendRepository(instance(MockFriendAPI));
const userID = 'SJOSADLK';

beforeEach(() => {
  resetCalls(MockFriendAPI);
});

describe('error catching', () => {
  it('should return general errors', async () => {
    // act
    const error = await friendRepo._leftOrRight(() => {
      throw new Error('so bad');
    });
    // assert
    expect(error).toStrictEqual(left(FriendError.general));
  });

  it('should return network errors', async () => {
    // act
    const error = await friendRepo._leftOrRight(() => {
      throw new ApolloError({errorMessage: 'LOL'});
    });
    // assert
    expect(error).toStrictEqual(left(FriendError.network));
  });

  it('requestAlreadyReceived error', async () => {
    // act
    const error = await friendRepo._leftOrRight(() => {
      throw getApolloError(friendErrors.REQUEST_RECEIVED);
    });
    // assert
    expect(error).toStrictEqual(left(FriendError.requestAlreadyReceived));
  });

  it('requestRemoved error', async () => {
    // act
    const error = await friendRepo._leftOrRight(() => {
      throw getApolloError(friendErrors.REQUEST_REMOVED);
    });
    // assert
    expect(error).toStrictEqual(left(FriendError.requestRemoved));
  });

  it('alreadyFriends error', async () => {
    // act
    const error = await friendRepo._leftOrRight(() => {
      throw getApolloError(friendErrors.ALREADY_FRIENDS);
    });
    // assert
    expect(error).toStrictEqual(left(FriendError.alreadyFriends));
  });
});

describe('getFriends', () => {
  it('should return the friends', async () => {
    // arrange
    when(MockFriendAPI.getFriends()).thenResolve([mockFriend]);
    // act
    const result = await friendRepo.getFriends();
    // assert
    expect(result).toStrictEqual(right([mockFriend]));
    verify(MockFriendAPI.getFriends()).once();
  });
});

describe('getFriendRequests', () => {
  it('should return the friend requests', async () => {
    // arrange
    when(MockFriendAPI.getFriendRequests()).thenResolve(mockFriendRequests);
    // act
    const result = await friendRepo.getFriendRequests();
    // assert
    expect(result).toStrictEqual(right(mockFriendRequests));
    verify(MockFriendAPI.getFriendRequests()).once();
  });
});

describe('getFriendshipInfo', () => {
  it('should return the friendship info', async () => {
    // arrange
    when(MockFriendAPI.getFriendshipInfo(anything()))
      .thenResolve(mockFriendshipInfo);
    const args: GetUserArgs = {
      userID
    };
    // act
    const result = await friendRepo.getFriendshipInfo(args);
    // assert
    expect(result).toStrictEqual(right(mockFriendshipInfo));
    verify(MockFriendAPI.getFriendshipInfo(args)).once();
  });
});

describe('sendFriendRequest', () => {
  it('should send the FR and return the friendship', async () => {
    // arrange
    when(MockFriendAPI.sendFriendRequest(anything()))
      .thenResolve(mockFriendship);
    // act
    const result = await friendRepo.sendFriendRequest(userID);
    // assert
    expect(result).toStrictEqual(right(mockFriendship));
    verify(MockFriendAPI.sendFriendRequest(userID)).once();
  });
});

describe('acceptFriendRequest', () => {
  it('should accept the FR and return the friendship', async () => {
    // arrange
    when(MockFriendAPI.acceptFriendRequest(anything()))
      .thenResolve(mockFriendship);
    // act
    const result = await friendRepo.acceptFriendRequest(userID);
    // assert
    expect(result).toStrictEqual(right(mockFriendship));
    verify(MockFriendAPI.acceptFriendRequest(userID)).once();
  });
});

describe('declineFriendRequest', () => {
  it('should decline the FR and return the friendship', async () => {
    // arrange
    when(MockFriendAPI.declineFriendRequest(anything()))
      .thenResolve(mockFriendship);
    // act
    const result = await friendRepo.declineFriendRequest(userID);
    // assert
    expect(result).toStrictEqual(right(mockFriendship));
    verify(MockFriendAPI.declineFriendRequest(userID)).once();
  });
});

describe('cancelFriendRequest', () => {
  it('should cancel the FR and return the friendship', async () => {
    // arrange
    when(MockFriendAPI.cancelFriendRequest(anything()))
      .thenResolve(mockFriendship);
    // act
    const result = await friendRepo.cancelFriendRequest(userID);
    // assert
    expect(result).toStrictEqual(right(mockFriendship));
    verify(MockFriendAPI.cancelFriendRequest(userID)).once();
  });
});

describe('unfriend', () => {
  it('should unfriend and return the friendship', async () => {
    // arrange
    when(MockFriendAPI.unfriend(anything()))
      .thenResolve(mockFriendship);
    // act
    const result = await friendRepo.unfriend(userID);
    // assert
    expect(result).toStrictEqual(right(mockFriendship));
    verify(MockFriendAPI.unfriend(userID)).once();
  });
});