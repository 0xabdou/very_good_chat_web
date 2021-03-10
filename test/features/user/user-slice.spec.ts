import {beforeEach, describe, expect, it} from "@jest/globals";
import {reset, verify, when} from "ts-mockito";
import mockServices from "../../mock-services";
import {getMockStore, mockUser, mockUserCreation} from "../../mock-objects";
import {left, right} from "fp-ts/Either";
import userReducer, {userActions, UserState} from "../../../src/features/user/user-slice";
import UserError from "../../../src/features/user/types/user-error";
import {PayloadAction} from "@reduxjs/toolkit";
import User from "../../../src/features/user/types/user";
import {AppStore} from "../../../src/store/store";


const MockUserRepository = mockServices.mocks.userRepository;
const MockStore = getMockStore();
const userError = UserError.general;
let mockStore: AppStore;

beforeEach(() => {
  reset(MockUserRepository);
  mockStore = MockStore();
});

const {getCurrentUser, createUser} = userActions;

describe('getCurrentUser', () => {
  const act = () => getCurrentUser()(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action if fulfilled', async () => {
    when(MockUserRepository.getCurrentUser()).thenResolve(right(mockUser));
    const result = await act();
    expect(result.payload).toStrictEqual(mockUser);
    expect(result.type).toStrictEqual(getCurrentUser.fulfilled.type);
    verify(MockUserRepository.getCurrentUser()).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockUserRepository.getCurrentUser()).thenResolve(left(userError));
    const result = await act();
    expect(result.payload).toStrictEqual(userError);
    expect(result.type).toStrictEqual(getCurrentUser.rejected.type);
    verify(MockUserRepository.getCurrentUser()).once();
  });

  describe('reducers', () => {
    const initialState: UserState = {
      initialized: false,
      currentUser: null,
      creatingUser: false,
      error: null,
    };

    it('should return the right state if fulfilled', () => {
      const action: PayloadAction<User> = {type: getCurrentUser.fulfilled.type, payload: mockUser};
      const result = userReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, currentUser: mockUser, initialized: true});
    });

    it('should return the right state if rejected with userNotFound error', () => {
      const action: PayloadAction<UserError> = {
        type: getCurrentUser.rejected.type,
        payload: UserError.notFound,
      };
      const result = userReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, initialized: true});
    });

    it('should return the right state if rejected with some other error', () => {
      const action: PayloadAction<UserError> = {type: getCurrentUser.rejected.type, payload: userError};
      const result = userReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});

describe('createUser', () => {
  const act = () => createUser(mockUserCreation)(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action if fulfilled', async () => {
    when(MockUserRepository.createUser(mockUserCreation))
      .thenResolve(right(mockUser));
    const expected: PayloadAction<User> = {
      type: createUser.fulfilled.type,
      payload: mockUser,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.createUser(mockUserCreation)).once();
  });

  it('should return the right action if rejected', async () => {
    when(MockUserRepository.createUser(mockUserCreation))
      .thenResolve(left(userError));
    const expected: PayloadAction<UserError> = {
      type: createUser.rejected.type,
      payload: userError,
    };
    const result = await act();
    expect(result.type).toStrictEqual(expected.type);
    expect(result.payload).toStrictEqual(expected.payload);
    verify(MockUserRepository.createUser(mockUserCreation)).once();
  });

  describe('reducers', () => {
    const initialState: UserState = {
      initialized: true,
      currentUser: null,
      creatingUser: false,
      error: null,
    };
    const loadingState: UserState = {...initialState, creatingUser: true};

    it('pending reducer should return the right state', () => {
      const action: PayloadAction = {
        type: createUser.pending.type,
        payload: undefined,
      };
      const result = userReducer(initialState, action);
      expect(result).toStrictEqual(loadingState);
    });

    it('fulfilled reducer should return the right state', () => {
      const action: PayloadAction<User> = {
        type: createUser.fulfilled.type,
        payload: mockUser,
      };
      const result = userReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, currentUser: mockUser});
    });

    it('rejected reducer should return the right state', () => {
      const action: PayloadAction<UserError> = {
        type: createUser.rejected.type,
        payload: userError,
      };
      const result = userReducer(loadingState, action);
      expect(result).toStrictEqual({...initialState, error: userError});
    });
  });
});