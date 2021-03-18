import {
  anything,
  deepEqual,
  instance,
  mock,
  resetCalls,
  verify,
  when
} from "ts-mockito";
import {IFriendRepository} from "../../../src/features/friend/data/friend-repository";
import StoreExtraArg from "../../../src/store/store-extra-arg";
import reducer, {
  friendProfileActions,
  FriendProfileState, initialFriendProfileState
} from "../../../src/features/friend/friend-profile-slice";
import {
  getMockStore,
  mockFriendship,
  mockFriendshipInfo,
  mockUser
} from "../../mock-objects";
import {AppStore} from "../../../src/store/store";
import {left, right} from "fp-ts/Either";
import FriendError from "../../../src/features/friend/types/friend-error";
import {PayloadAction} from "@reduxjs/toolkit";

const MockFriendRepo = mock<IFriendRepository>();
const MockStore = getMockStore();
let mockStore: AppStore;
const extraArg = {
  friendRepo: instance(MockFriendRepo)
} as StoreExtraArg;
const username= 'usernameeeeeeee';
const friendError = FriendError.network;

const {reset, getFriendshipInfo} = friendProfileActions;

beforeEach(() => {
  mockStore = MockStore();
  resetCalls(MockFriendRepo);
});

describe('reset', () => {
  // arrange
  const action: PayloadAction = {
    type: reset.type,
    payload: undefined
  };
  const state : FriendProfileState = {
    user: mockUser,
    friendship: mockFriendship,
    loading: false,
    modifyingFriendship: false,
    error: null
  };
  // act
  const result = reducer(state, action);
  // assert
  expect(result).toStrictEqual(initialFriendProfileState);
});

describe('getFriendshipInfo', () => {
  const act = () => getFriendshipInfo(username)(
    mockStore.dispatch,
    mockStore.getState,
    extraArg
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.getFriendshipInfo(anything()))
      .thenResolve(right(mockFriendshipInfo));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriendshipInfo.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendshipInfo);
    verify(MockFriendRepo.getFriendshipInfo(deepEqual({username}))).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.getFriendshipInfo(anything()))
      .thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriendshipInfo.rejected.type);
    expect(result.payload).toBe(friendError);
    verify(MockFriendRepo.getFriendshipInfo(deepEqual({username}))).once();
  });
});