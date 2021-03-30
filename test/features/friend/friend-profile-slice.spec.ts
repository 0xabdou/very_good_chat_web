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
  _handleFSChanged,
  _handleFSChanging,
  _handleRejected,
  friendProfileActions,
  FriendProfileState,
  initialFriendProfileState
} from "../../../src/features/friend/friend-profile-slice";
import {
  getMockStore,
  mockBlock,
  mockFriendship,
  mockFriendshipInfo,
  mockUser
} from "../../mock-objects";
import {AppState, AppStore} from "../../../src/store/store";
import {left, right} from "fp-ts/Either";
import FriendError from "../../../src/features/friend/types/friend-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {
  Friendship,
  FriendshipInfo,
  FriendshipStatus
} from "../../../src/features/friend/types/friendship";
import {IBlockRepository} from "../../../src/features/block/data/block-respository";
import BlockError, {blockToFriendError} from "../../../src/features/block/types/block-error";

const MockFriendRepo = mock<IFriendRepository>();
const MockBlockRepo = mock<IBlockRepository>();
const MockStore = getMockStore();
let mockStore: AppStore;
const extraArg = {
  friendRepo: instance(MockFriendRepo),
  blockRepo: instance(MockBlockRepo)
} as StoreExtraArg;
const username = 'usernausereeeeeee';
const friendError = FriendError.network;
const loadedState: FriendProfileState = {
  ...initialFriendProfileState,
  user: mockUser,
  friendship: mockFriendship
};

const {
  reset,
  getFriendshipInfo,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  block,
  unblock
} = friendProfileActions;


beforeEach(() => {
  mockStore = MockStore({
    friendProfile: loadedState
  } as AppState);
  resetCalls(MockFriendRepo);
  resetCalls(MockBlockRepo);
});

describe('reset', () => {
  // arrange
  const action: PayloadAction = {
    type: reset.type,
    payload: undefined
  };
  const state: FriendProfileState = {
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
    verify(MockFriendRepo.getFriendshipInfo(deepEqual({username})))
      .once();
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

  describe('reducers', () => {
    it('should return the right state when pending', () => {
      // arrange
      const action: PayloadAction = {
        type: getFriendshipInfo.pending.type, payload: undefined
      };
      const initialState: FriendProfileState = {
        ...initialFriendProfileState,
        error: FriendError.general,
      };
      // act
      const result = reducer(initialState, action);
      // assert
      expect(result).toStrictEqual({
        ...initialState,
        loading: true,
        error: null,
      });
    });

    it('should return the right state when fulfilled', () => {
      // arrange
      const action: PayloadAction<FriendshipInfo> = {
        type: getFriendshipInfo.fulfilled.type, payload: {
          friendship: mockFriendship,
          user: mockUser
        }
      };
      const initialState: FriendProfileState = {
        ...initialFriendProfileState,
        loading: true,
      };
      // act
      const result = reducer(initialState, action);
      // assert
      expect(result).toStrictEqual({
        ...initialState,
        loading: false,
        friendship: mockFriendship,
        user: mockUser
      });
    });

    it('should return the right state when rejected', () => {
      // arrange
      const action: PayloadAction<FriendError> = {
        type: getFriendshipInfo.rejected.type, payload: FriendError.general
      };
      const initialState: FriendProfileState = {
        ...initialFriendProfileState,
        loading: true,
      };
      // act
      const result = reducer(initialState, action);
      // assert
      expect(result).toStrictEqual({
        ...initialState,
        loading: false,
        error: FriendError.general
      });
    });
  });
});

describe('reducer logic', () => {
  describe('_handleRejected', () => {
    test('defined error', () => {
      const state: FriendProfileState = {
        ...initialFriendProfileState,
        loading: true,
        modifyingFriendship: true
      };
      _handleRejected(state, {type: 'any', payload: FriendError.network});
      expect(state.loading).toBe(false);
      expect(state.modifyingFriendship).toBe(false);
      expect(state.error).toBe(FriendError.network);
    });

    test('undefined error', () => {
      const state: FriendProfileState = {
        ...initialFriendProfileState,
        loading: true,
        modifyingFriendship: true
      };
      _handleRejected(state, {type: 'any', payload: undefined});
      expect(state.loading).toBe(false);
      expect(state.modifyingFriendship).toBe(false);
      expect(state.error).toBe(FriendError.general);
    });
  });

  test('_handleFSChanging', () => {
    const state: FriendProfileState = {
      ...initialFriendProfileState,
      error: FriendError.general
    };
    _handleFSChanging(state);
    expect(state.modifyingFriendship).toBe(true);
    expect(state.error).toBeNull();
  });

  test('_handleFSChanged', () => {
    const state: FriendProfileState = {
      ...initialFriendProfileState,
      modifyingFriendship: true
    };
    _handleFSChanged(state, {type: 'any', payload: mockFriendship});
    expect(state.modifyingFriendship).toBe(false);
    expect(state.friendship).toStrictEqual(mockFriendship);
  });
});

const friendshipAct = (
  actionCreator: typeof sendFriendRequest,
  store: AppStore = mockStore) => {
  return actionCreator()(
    store.dispatch,
    store.getState,
    extraArg
  );
};

const whenNoUserExists = (act: (store: AppStore) => Promise<any>) => {
  it('should reject if no user exists in the state', async () => {
    // arrange
    const customState: FriendProfileState = {...loadedState, user: null};
    const customStore = MockStore({friendProfile: customState} as AppState);
    // act
    const result = await act(customStore);
    // assert
    expect(result.payload).toBe(FriendError.general);
  });
};

describe('sendFriendRequest', () => {
  const act = () => friendshipAct(sendFriendRequest);

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.sendFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(sendFriendRequest.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendship);
    verify(MockFriendRepo.sendFriendRequest(loadedState.user!.id)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.sendFriendRequest(anything()))
      .thenResolve(left(FriendError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(sendFriendRequest.rejected.type);
    expect(result.payload).toStrictEqual(FriendError.network);
    verify(MockFriendRepo.sendFriendRequest(loadedState.user!.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(sendFriendRequest, s));
});

describe('cancelFriendRequest', () => {
  const act = () => friendshipAct(cancelFriendRequest);

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.cancelFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(cancelFriendRequest.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendship);
    verify(MockFriendRepo.cancelFriendRequest(loadedState.user!.id)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.cancelFriendRequest(anything()))
      .thenResolve(left(FriendError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(cancelFriendRequest.rejected.type);
    expect(result.payload).toStrictEqual(FriendError.network);
    verify(MockFriendRepo.cancelFriendRequest(loadedState.user!.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(cancelFriendRequest, s));
});

describe('acceptFriendRequest', () => {
  const act = () => friendshipAct(acceptFriendRequest);

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.acceptFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(acceptFriendRequest.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendship);
    verify(MockFriendRepo.acceptFriendRequest(loadedState.user!.id)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.acceptFriendRequest(anything()))
      .thenResolve(left(FriendError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(acceptFriendRequest.rejected.type);
    expect(result.payload).toStrictEqual(FriendError.network);
    verify(MockFriendRepo.acceptFriendRequest(loadedState.user!.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(acceptFriendRequest, s));
});

describe('declineFriendRequest', () => {
  const act = () => friendshipAct(declineFriendRequest);

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.declineFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(declineFriendRequest.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendship);
    verify(MockFriendRepo.declineFriendRequest(loadedState.user!.id)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.declineFriendRequest(anything()))
      .thenResolve(left(FriendError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(declineFriendRequest.rejected.type);
    expect(result.payload).toStrictEqual(FriendError.network);
    verify(MockFriendRepo.declineFriendRequest(loadedState.user!.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(declineFriendRequest, s));
});

describe('unfriend', () => {
  const act = () => friendshipAct(unfriend);

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.unfriend(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(unfriend.fulfilled.type);
    expect(result.payload).toStrictEqual(mockFriendship);
    verify(MockFriendRepo.unfriend(loadedState.user!.id)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.unfriend(anything()))
      .thenResolve(left(FriendError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(unfriend.rejected.type);
    expect(result.payload).toStrictEqual(FriendError.network);
    verify(MockFriendRepo.unfriend(loadedState.user!.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(unfriend, s));
});

describe('block', () => {
  const act = () => friendshipAct(block);

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockBlockRepo.block(anything())).thenResolve(right(mockBlock));
    const expectedPayload: Friendship = {status: FriendshipStatus.BLOCKING};
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(block.fulfilled.type);
    expect(result.payload).toStrictEqual(expectedPayload);
    verify(MockBlockRepo.block(mockUser.id)).once();
  });

  it('should return the right action if rejected', async () => {
    // arrange
    const error = BlockError.network;
    when(MockBlockRepo.block(anything())).thenResolve(left(error));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(block.rejected.type);
    expect(result.payload).toStrictEqual(blockToFriendError(error));
    verify(MockBlockRepo.block(mockUser.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(block, s));
});

describe('unblock', () => {
  const act = () => friendshipAct(unblock);

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockBlockRepo.unblock(anything())).thenResolve(right(mockUser.id));
    const expectedPayload: Friendship = {status: FriendshipStatus.STRANGERS};
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(unblock.fulfilled.type);
    expect(result.payload).toStrictEqual(expectedPayload);
    verify(MockBlockRepo.unblock(mockUser.id)).once();
  });

  it('should return the right action if rejected', async () => {
    // arrange
    const error = BlockError.network;
    when(MockBlockRepo.unblock(anything())).thenResolve(left(error));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(unblock.rejected.type);
    expect(result.payload).toStrictEqual(blockToFriendError(error));
    verify(MockBlockRepo.unblock(mockUser.id)).once();
  });

  whenNoUserExists((s) => friendshipAct(unblock, s));
});
