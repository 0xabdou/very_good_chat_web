import {anything, instance, mock, verify, when} from "ts-mockito";
import {IFriendAPI} from "../../../../src/features/friend/data/sources/friend-api";
import FriendRepository
  from "../../../../src/features/friend/data/friend-repository";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import FriendError from "../../../../src/features/friend/types/friend-error";
import {mockFriendship, mockFriendshipInfo} from "../../../mock-objects";
import {GetUserArgs} from "../../../../src/features/user/types/user";

const MockFriendAPI = mock<IFriendAPI>();
const friendRepo = new FriendRepository(instance(MockFriendAPI));
const userID = 'SJOSADLK';

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
});

describe('getFriendshipInfo', async () => {
  it('should return the friendship info', async () => {
    // arrange
    when(MockFriendAPI.getFriendshipInfo(anything()))
      .thenResolve(mockFriendshipInfo);
    const args : GetUserArgs  = {
      userID
    }
    // act
    const result = await friendRepo.getFriendshipInfo(args);
    // assert
    expect(result).toStrictEqual(right(mockFriendshipInfo));
    verify(MockFriendAPI.getFriendshipInfo(args)).once();
  });
});

describe('sendFriendRequest', async () => {
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

describe('acceptFriendRequest', async () => {
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

describe('declineFriendRequest', async () => {
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

describe('cancelFriendRequest', async () => {
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

describe('unfriend', async () => {
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