import {beforeEach, describe, expect, it} from "@jest/globals";
import {anything, reset, verify, when} from "ts-mockito";
import mockServices from "../../mock-services";
import {
  getMockStore,
  mockMe,
  mockUserCreation,
  mockUserUpdate
} from "../../mock-objects";
import {left, right} from "fp-ts/Either";
import meReducer, {
  MeState,
  meActions
} from "../../../src/features/user/me-slice";
import UserError from "../../../src/features/user/types/user-error";
import {PayloadAction} from "@reduxjs/toolkit";
import User from "../../../src/features/user/types/user";
import {AppStore} from "../../../src/store/store";


const MockUserRepository = mockServices.mocks.meRepo;
const MockStore = getMockStore();
const userError = UserError.general;
let mockStore: AppStore;

beforeEach(() => {
  reset(MockUserRepository);
  mockStore = MockStore();
});

const {getMe, createMe, updateMe} = meActions;

describe('getMe', () => {
  const act = () => getMe()(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action if fulfilled', async () => {
    when(MockUserRepository.getMe()).thenResolve(right(mockMe));
    const result = await act();
    expect(result.payload).toStrictEqual(mockMe);
    expect(result.type).toStrictEqual(getMe.fulfilled.type);
    verify(MockUserRepository.getMe()).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockUserRepository.getMe()).thenResolve(left(userError));
    const result = await act();
    expect(result.payload).toStrictEqual(userError);
    expect(result.type).toStrictEqual(getMe.rejected.type);
    verify(MockUserRepository.getMe()).once();
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
      const result = meReducer(initialState, action);
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
      const result = meReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, initialized: true});
    });

    it('should return the right state if rejected with some other error', () => {
      const action: PayloadAction<UserError> = {
        type: getMe.rejected.type,
        payload: userError
      };
      const result = meReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('createMe', () => {
  const act = () => createMe(mockUserCreation)(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action if fulfilled', async () => {
    when(MockUserRepository.createMe(mockUserCreation))
      .thenResolve(right(mockMe));
    const expected: PayloadAction<User> = {
      type: createMe.fulfilled.type,
      payload: mockMe,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.createMe(mockUserCreation)).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockUserRepository.createMe(mockUserCreation))
      .thenResolve(left(userError));
    const expected: PayloadAction<UserError> = {
      type: createMe.rejected.type,
      payload: userError,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.createMe(mockUserCreation)).once();
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
      const result = meReducer(initialState, action);
      expect(result).toStrictEqual(loadingState);
    });

    it('fulfilled reducer should return the right state', () => {
      const action: PayloadAction<User> = {
        type: createMe.fulfilled.type,
        payload: mockMe,
      };
      const result = meReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, me: mockMe});
    });

    it('rejected reducer should return the right state', () => {
      const action: PayloadAction<UserError> = {
        type: createMe.rejected.type,
        payload: userError,
      };
      const result = meReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('updateMe', () => {
  const act = () => updateMe(mockUserUpdate)(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action if fulfilled', async () => {
    when(MockUserRepository.updateMe(anything()))
      .thenResolve(right(mockMe));
    const expected: PayloadAction<User> = {
      type: updateMe.fulfilled.type,
      payload: mockMe,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.updateMe(mockUserUpdate)).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockUserRepository.updateMe(mockUserUpdate))
      .thenResolve(left(userError));
    const expected: PayloadAction<UserError> = {
      type: updateMe.rejected.type,
      payload: userError,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.updateMe(mockUserUpdate)).once();
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
      const result = meReducer(initialState, action);
      expect(result).toStrictEqual(loadingState);
    });

    it('fulfilled reducer should return the right state', () => {
      const action: PayloadAction<User> = {
        type: updateMe.fulfilled.type,
        payload: mockMe,
      };
      const result = meReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, me: mockMe});
    });

    it('rejected reducer should return the right state', () => {
      const action: PayloadAction<UserError> = {
        type: updateMe.rejected.type,
        payload: userError,
      };
      const result = meReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});