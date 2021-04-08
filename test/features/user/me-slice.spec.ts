import {beforeEach, describe, expect, it} from "@jest/globals";
import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";
import {
  getMockStore,
  initialMeState,
  mockMe,
  mockUserCreation,
  mockUserUpdate
} from "../../mock-objects";
import {left, right} from "fp-ts/Either";
import reducer, {meActions, MeState} from "../../../src/features/user/me-slice";
import UserError from "../../../src/features/user/types/user-error";
import {PayloadAction} from "@reduxjs/toolkit";
import User from "../../../src/features/user/types/user";
import {AppState, AppStore} from "../../../src/core/redux/store";
import {IMeRepository} from "../../../src/features/user/data/me-repository";
import StoreExtraArg from "../../../src/core/redux/store-extra-arg";


const MockMeRepo = mock<IMeRepository>();
const MockStore = getMockStore();
const userError = UserError.general;
let mockStore: AppStore;
const extra = {
  meRepo: instance(MockMeRepo)
} as StoreExtraArg;

beforeEach(() => {
  resetCalls(MockMeRepo);
  mockStore = MockStore();
});

const {
  getMe,
  createMe,
  updateMe,
  toggleActiveStatus,
  updateLastSeen
} = meActions;

describe('getMe', () => {
  const act = () => getMe()(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action if fulfilled', async () => {
    when(MockMeRepo.getMe()).thenResolve(right(mockMe));
    const result = await act();
    expect(result.payload).toStrictEqual(mockMe);
    expect(result.type).toStrictEqual(getMe.fulfilled.type);
    verify(MockMeRepo.getMe()).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockMeRepo.getMe()).thenResolve(left(userError));
    const result = await act();
    expect(result.payload).toStrictEqual(userError);
    expect(result.type).toStrictEqual(getMe.rejected.type);
    verify(MockMeRepo.getMe()).once();
  });

  describe('reducers', () => {
    const initialState: MeState = {
      initialized: false,
      me: null,
      updatingUser: false,
      error: null,
    };

    it('should return the right state if fulfilled', () => {
      const action: PayloadAction<User> = {
        type: getMe.fulfilled.type,
        payload: mockMe
      };
      const result = reducer(initialState, action);
      expect(result).toStrictEqual({
        ...initialState,
        me: mockMe,
        initialized: true
      });
    });

    it('should return the right state if rejected with userNotFound error', () => {
      const action: PayloadAction<UserError> = {
        type: getMe.rejected.type,
        payload: UserError.notFound,
      };
      const result = reducer(initialState, action);
      expect(result).toStrictEqual({...initialState, initialized: true});
    });

    it('should return the right state if rejected with some other error', () => {
      const action: PayloadAction<UserError> = {
        type: getMe.rejected.type,
        payload: userError
      };
      const result = reducer(initialState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('createMe', () => {
  const act = () => createMe(mockUserCreation)(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action if fulfilled', async () => {
    when(MockMeRepo.createMe(mockUserCreation))
      .thenResolve(right(mockMe));
    const expected: PayloadAction<User> = {
      type: createMe.fulfilled.type,
      payload: mockMe,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockMeRepo.createMe(mockUserCreation)).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockMeRepo.createMe(mockUserCreation))
      .thenResolve(left(userError));
    const expected: PayloadAction<UserError> = {
      type: createMe.rejected.type,
      payload: userError,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockMeRepo.createMe(mockUserCreation)).once();
  });

  describe('reducers', () => {
    const initialState: MeState = {
      initialized: true,
      me: null,
      updatingUser: false,
      error: null,
    };
    const loadingState: MeState = {...initialState, updatingUser: true};

    it('pending reducer should return the right state', () => {
      const action: PayloadAction = {
        type: createMe.pending.type,
        payload: undefined,
      };
      const result = reducer(initialState, action);
      expect(result).toStrictEqual(loadingState);
    });

    it('fulfilled reducer should return the right state', () => {
      const action: PayloadAction<User> = {
        type: createMe.fulfilled.type,
        payload: mockMe,
      };
      const result = reducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, me: mockMe});
    });

    it('rejected reducer should return the right state', () => {
      const action: PayloadAction<UserError> = {
        type: createMe.rejected.type,
        payload: userError,
      };
      const result = reducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('updateMe', () => {
  const act = () => updateMe(mockUserUpdate)(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action if fulfilled', async () => {
    when(MockMeRepo.updateMe(anything()))
      .thenResolve(right(mockMe));
    const expected: PayloadAction<User> = {
      type: updateMe.fulfilled.type,
      payload: mockMe,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockMeRepo.updateMe(mockUserUpdate)).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockMeRepo.updateMe(mockUserUpdate))
      .thenResolve(left(userError));
    const expected: PayloadAction<UserError> = {
      type: updateMe.rejected.type,
      payload: userError,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockMeRepo.updateMe(mockUserUpdate)).once();
  });

  describe('reducers', () => {
    const initialState: MeState = {
      initialized: true,
      me: null,
      updatingUser: false,
      error: null,
    };
    const loadingState: MeState = {...initialState, updatingUser: true};

    it('pending reducer should return the right state', () => {
      const action: PayloadAction = {
        type: updateMe.pending.type,
        payload: undefined,
      };
      const result = reducer(initialState, action);
      expect(result).toStrictEqual(loadingState);
    });

    it('fulfilled reducer should return the right state', () => {
      const action: PayloadAction<User> = {
        type: updateMe.fulfilled.type,
        payload: mockMe,
      };
      const result = reducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, me: mockMe});
    });

    it('rejected reducer should return the right state', () => {
      const action: PayloadAction<UserError> = {
        type: updateMe.rejected.type,
        payload: userError,
      };
      const result = reducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('toggleActiveStatus', () => {
  const act = (store: AppStore = mockStore) => toggleActiveStatus()(
    store.dispatch,
    store.getState,
    extra
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    const state: MeState = {...initialMeState, me: mockMe};
    const mockStore = MockStore({me: state} as AppState);
    when(MockMeRepo.updateActiveStatus(anything())).thenResolve(right(true));
    // act
    const result = await act(mockStore);
    // assert
    expect(result.type).toBe(toggleActiveStatus.fulfilled.type);
    expect(result.payload).toBe(true);
    verify(MockMeRepo.updateActiveStatus(mockMe.activeStatus)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    const state: MeState = {...initialMeState, me: mockMe};
    const mockStore = MockStore({me: state} as AppState);
    when(MockMeRepo.updateActiveStatus(anything())).thenResolve(left(userError));
    // act
    const result = await act(mockStore);
    // assert
    expect(result.type).toBe(toggleActiveStatus.rejected.type);
    expect(result.payload).toBe(userError);
    verify(MockMeRepo.updateActiveStatus(mockMe.activeStatus)).once();
  });

  describe('reducers', () => {
    const initialState: MeState = {...initialMeState, me: mockMe};
    const pendingState: MeState = {
      ...initialState,
      me: {
        ...initialState.me!,
        activeStatus: !initialState.me!.activeStatus
      },
      updatingUser: true,
    };
    it('should return the right state when pending', () => {
      // arrange
      const inputState = initialState;
      const outputState = pendingState;
      const action: PayloadAction = {
        type: toggleActiveStatus.pending.type, payload: undefined
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state when fulfilled', () => {
      // arrange
      const inputState = pendingState;
      const outputState: MeState = {...pendingState, updatingUser: false};
      const action: PayloadAction<boolean> = {
        type: toggleActiveStatus.fulfilled.type, payload: true
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state when rejected', () => {
      // arrange
      const inputState = pendingState;
      const outputState: MeState = {...initialState, error: userError};
      const action: PayloadAction<UserError> = {
        type: toggleActiveStatus.rejected.type, payload: userError
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});

describe('updateLastSeen', () => {
  const act = () => updateLastSeen()(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  const lastSeen = new Date().getTime();

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockMeRepo.updateLastSeen()).thenResolve(right(lastSeen));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(updateLastSeen.fulfilled.type);
    expect(result.payload).toBe(lastSeen);
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockMeRepo.updateLastSeen()).thenResolve(left(userError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(updateLastSeen.rejected.type);
    expect(result.payload).toBe(userError);
  });
});