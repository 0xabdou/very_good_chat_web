import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";
import {IFriendRepository} from "../../../src/features/friend/data/friend-repository";
import {
  getMockStore,
  mockFriend,
  mockFriendRequests,
  mockFriendship,
  mockUser,
} from "../../mock-objects";
import {AppState, AppStore} from "../../../src/store/store";
import StoreExtraArg from "../../../src/store/store-extra-arg";
import FriendError from "../../../src/features/friend/types/friend-error";
import reducer, {
  _handleRejected,
  _handleRequestFulfilled,
  _handleRequestPending,
  _handleRequestRejected,
  friendsActions,
  FriendsState,
  initialFriendsState
} from "../../../src/features/friend/friends-slice";
import {left, right} from "fp-ts/Either";
import {PayloadAction} from "@reduxjs/toolkit";
import {FriendRequests} from "../../../src/features/friend/types/friend-request";
import Friend from "../../../src/features/friend/types/friend";

const MockFriendRepo = mock<IFriendRepository>();
const MockStore = getMockStore();
let mockStore: AppStore;
const extraArg = {
  friendRepo: instance(MockFriendRepo)
} as StoreExtraArg;
const friendError = FriendError.network;
const userID = 'userIDDDDDDD';

const {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest
} = friendsActions;

beforeEach(() => {
  mockStore = MockStore({
    friends: initialFriendsState
  } as AppState);
  resetCalls(MockFriendRepo);
});

describe('reducer logic', () => {
  const stateWithReqs: FriendsState = {
    ...initialFriendsState,
    friendRequests: {
      sent: [
        {
          user: {...mockUser, id: userID},
          date: new Date().getTime(),
        },
        {
          user: {...mockUser, id: 'bleh'},
          date: new Date().getTime(),
        },
      ],
      received: [
        {
          user: {...mockUser, id: userID},
          date: new Date().getTime(),
        },
        {
          user: {...mockUser, id: 'bleh'},
          date: new Date().getTime(),
        },
      ]
    },
    beingTreated: [userID]
  };
  describe('_handleRejected', () => {
    test('defined payload', () => {
      // arrange
      const action = {type: 'any', payload: friendError};
      const state = {...initialFriendsState};
      // act
      _handleRejected(state, action);
      // assert
      expect(state).toStrictEqual({
        ...initialFriendsState,
        requestsError: friendError
      });
    });
    test('undefined payload', () => {
      // arrange
      const action = {type: 'any', payload: undefined};
      const state = {...initialFriendsState};
      // act
      _handleRejected(state, action);
      // assert
      expect(state)
        .toStrictEqual({
          ...initialFriendsState,
          requestsError: FriendError.general
        });
    });
  });

  describe('_handleRequestPending', () => {
    it('should add the user ID to the list of reqs being treated', () => {
      // arrange
      const state = {
        ...initialFriendsState,
        requestsError: FriendError.general
      };
      const action: PayloadAction<void, string, { arg: string }> = {
        type: 'any',
        payload: undefined,
        meta: {arg: userID}
      };
      // act
      _handleRequestPending(state, action);
      // assert
      expect(state.beingTreated[0]).toBe(userID);
      expect(state.requestsError).toBeNull();
    });
  });

  describe('_handleRequestFulfilled', () => {
    it('should remove the user ID from the list of reqs being treated ' +
      'and remove the request from the lists', () => {
      // arrange
      const state = {...stateWithReqs};
      const action: PayloadAction<string, string, { arg: string }> = {
        type: 'any',
        payload: 'bleh',
        meta: {arg: userID}
      };
      // act
      _handleRequestFulfilled(state, action);
      // assert
      expect(state.beingTreated).toHaveLength(0);
      expect(state.friendRequests!.received).toHaveLength(1);
      expect(state.friendRequests!.received[0].user.id).toBe('bleh');
      expect(state.friendRequests!.sent).toHaveLength(1);
      expect(state.friendRequests!.sent[0].user.id).toBe('bleh');
    });
  });

  describe('_handleRequestRejected', () => {
    const shouldRemove = (requestsError: FriendError | undefined) => {
      it('should remove the user ID from the list of reqs being treated ' +
        'and remove the request from the lists', () => {
        // arrange
        const state = {...stateWithReqs};
        const action: PayloadAction<FriendError | undefined, string, { arg: string }> = {
          type: 'any',
          payload: requestsError,
          meta: {arg: userID}
        };
        // act
        _handleRequestRejected(state, action);
        // assert
        expect(state.beingTreated).toHaveLength(0);
        expect(state.friendRequests!.received).toHaveLength(1);
        expect(state.friendRequests!.received[0].user.id).toBe('bleh');
        expect(state.friendRequests!.sent).toHaveLength(1);
        expect(state.friendRequests!.sent[0].user.id).toBe('bleh');
        expect(state.requestsError).toBe(requestsError);
      });
    };

    const shouldKeep = (requestsError: FriendError | undefined) => {
      it('should not remove the user ID from the list of reqs being treated ' +
        'and keep the req in the lists', () => {
        // arrange
        const state = {...stateWithReqs};
        const action: PayloadAction<FriendError | undefined, string, { arg: string }> = {
          type: 'any',
          payload: requestsError,
          meta: {arg: userID}
        };
        // act
        _handleRequestRejected(state, action);
        // assert
        expect(state.beingTreated).toHaveLength(0);
        expect(state.friendRequests!.received).toHaveLength(2);
        expect(state.friendRequests!.sent).toHaveLength(2);
        expect(state.requestsError).toBe(requestsError == undefined ? FriendError.general : requestsError);
      });
    };

    shouldRemove(FriendError.alreadyFriends);
    shouldRemove(FriendError.requestRemoved);
    shouldKeep(FriendError.general);
    shouldKeep(FriendError.network);
    shouldKeep(FriendError.requestAlreadyReceived);
    shouldKeep(undefined);
  });
});

describe('getFriends', () => {
  const act = () => getFriends()(
    mockStore.dispatch,
    mockStore.getState,
    extraArg
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.getFriends()).thenResolve(right([mockFriend]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriends.fulfilled.type);
    expect(result.payload).toStrictEqual([mockFriend]);
    verify(MockFriendRepo.getFriends()).once();
  });

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.getFriends()).thenResolve(right([mockFriend]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriends.fulfilled.type);
    expect(result.payload).toStrictEqual([mockFriend]);
    verify(MockFriendRepo.getFriends()).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.getFriends()).thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriends.rejected.type);
    expect(result.payload).toStrictEqual(friendError);
    verify(MockFriendRepo.getFriends()).once();
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const inputState: FriendsState = {
        ...initialFriendsState, friendsError: friendError
      };
      const outputState: FriendsState = {...initialFriendsState};
      const action: PayloadAction = {
        type: getFriends.pending.type,
        payload: undefined
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const inputState: FriendsState = {...initialFriendsState};
      const outputState: FriendsState = {
        ...initialFriendsState, friends: [mockFriend]
      };
      const action: PayloadAction<Friend[]> = {
        type: getFriends.fulfilled.type,
        payload: [mockFriend]
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if rejected', () => {
      // arrange
      const inputState: FriendsState = {...initialFriendsState};
      const outputState: FriendsState = {
        ...initialFriendsState, friendsError: friendError
      };
      const action: PayloadAction<FriendError> = {
        type: getFriends.rejected.type,
        payload: friendError
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});

describe('getFriendRequests', () => {
  const act = () => getFriendRequests()(
    mockStore.dispatch,
    mockStore.getState,
    extraArg
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.getFriendRequests()).thenResolve(right(mockFriendRequests));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriendRequests.fulfilled.type);
    expect(result.payload).toBe(mockFriendRequests);
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.getFriendRequests()).thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getFriendRequests.rejected.type);
    expect(result.payload).toBe(friendError);
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const state = {
        ...initialFriendsState,
        friendRequest: mockFriendRequests,
        requestsError: FriendError.general
      };
      const action: PayloadAction = {
        type: getFriendRequests.pending.type,
        payload: undefined
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({...state, requestsError: null});
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const state = {...initialFriendsState};
      const action: PayloadAction<FriendRequests> = {
        type: getFriendRequests.fulfilled.type,
        payload: mockFriendRequests
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({
        ...state,
        friendRequests: mockFriendRequests
      });
    });

    it('should return the right state if rejected', () => {
      // arrange
      const state = {...initialFriendsState};
      const requestsError = FriendError.network;
      const action: PayloadAction<FriendError> = {
        type: getFriendRequests.rejected.type,
        payload: requestsError
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({...state, requestsError});
    });
  });
});

describe('acceptFriendRequest', () => {
  const act = () =>
    acceptFriendRequest(userID)(
      mockStore.dispatch,
      mockStore.getState,
      extraArg
    );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.acceptFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(acceptFriendRequest.fulfilled.type);
  });
  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.acceptFriendRequest(anything()))
      .thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(acceptFriendRequest.rejected.type);
    expect(result.payload).toBe(friendError);
  });
});

describe('declineFriendRequest', () => {
  const act = () =>
    declineFriendRequest(userID)(
      mockStore.dispatch,
      mockStore.getState,
      extraArg
    );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.declineFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(declineFriendRequest.fulfilled.type);
  });
  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.declineFriendRequest(anything()))
      .thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(declineFriendRequest.rejected.type);
    expect(result.payload).toBe(friendError);
  });
});

describe('cancelFriendRequest', () => {
  const act = () =>
    cancelFriendRequest(userID)(
      mockStore.dispatch,
      mockStore.getState,
      extraArg
    );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockFriendRepo.cancelFriendRequest(anything()))
      .thenResolve(right(mockFriendship));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(cancelFriendRequest.fulfilled.type);
  });
  it('should return the right action when rejected', async () => {
    // arrange
    when(MockFriendRepo.cancelFriendRequest(anything()))
      .thenResolve(left(friendError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(cancelFriendRequest.rejected.type);
    expect(result.payload).toBe(friendError);
  });
});
