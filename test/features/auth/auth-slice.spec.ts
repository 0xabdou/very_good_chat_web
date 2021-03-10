import {beforeEach, describe, expect, it} from "@jest/globals";
import authReducer, {
  authActions,
  AuthState,
  AuthUser
} from "../../../src/features/auth/auth-slice";
import mockServices, {resetMocks} from "../../mock-services";
import {verify, when} from "ts-mockito";
import LoginResult from "../../../src/features/auth/types/login-result";
import {left, right} from "fp-ts/Either";
import AuthError from "../../../src/features/auth/types/auth-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {getMockStore, initialAuthState} from "../../mock-objects";
import {AppStore} from "../../../src/store/store";


const {
  signInWithGoogle,
  getAccessToken,
  signOut
} = authActions;

const MockStore = getMockStore();
const accessToken = 'some_access_token';
const authUser: AuthUser = {displayName: 'Display Name', photoURL: null};
const loginResult = {...authUser, accessToken};
const authError = AuthError.general;
const initialState = initialAuthState;
let mockStore: AppStore;
const loadingState: AuthState = {...initialState, loading: true};

beforeEach(() => {
  mockStore = MockStore();
  resetMocks();
});

describe('signInWithGoogle thunk', () => {
  const act = () => signInWithGoogle()(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action when fulfilled', async () => {
    when(mockServices.mocks.authRepository.signInWithGoogle()).thenResolve(
      right(loginResult)
    );
    const result = await act();
    expect(result.payload).toStrictEqual(loginResult);
    expect(result.type).toStrictEqual(signInWithGoogle.fulfilled.type);
    verify(mockServices.mocks.authRepository.signInWithGoogle()).once();
  });

  it('should return the right action when rejected', async () => {
    when(mockServices.mocks.authRepository.signInWithGoogle()).thenResolve(left(authError));
    const result = await act();
    expect(result.payload).toStrictEqual(authError);
    expect(result.type).toStrictEqual(signInWithGoogle.rejected.type);
    verify(mockServices.mocks.authRepository.signInWithGoogle()).once();
  });

  describe('reducers', () => {
    it('should set loading to true if pending', async () => {
      const action: PayloadAction = {
        type: signInWithGoogle.pending.type,
        payload: undefined
      };
      const result = authReducer(initialState, action);
      expect(result).toStrictEqual({...initialState, loading: true});
    });

    it(
      `should set authUser, accessToken, initialized to true, 
      and loading to false if fulfilled`,
      async () => {
        const action: PayloadAction<LoginResult> = {
          type: signInWithGoogle.fulfilled.type,
          payload: loginResult,
        };
        const result = authReducer(loadingState, action);
        expect(result).toStrictEqual({
          ...loadingState,
          loading: false,
          initialized: true,
          accessToken,
          authUser,
        });
      },
    );

    it('should set authError, and loading to false if rejected', async () => {
      const action: PayloadAction<AuthError> = {
        type: signInWithGoogle.rejected.type,
        payload: authError,
      };
      const result = authReducer(loadingState, action);
      expect(result).toStrictEqual({
        ...loadingState,
        loading: false,
        authError
      });
    });
  });
});

describe('getAccessToken thunk', () => {
  const act = () => getAccessToken()(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(mockServices.mocks.authRepository.getAccessToken())
      .thenResolve(right(accessToken));
    // act
    const result = await act();
    // assert
    expect(result.payload).toStrictEqual(accessToken);
    verify(mockServices.mocks.authRepository.getAccessToken()).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(mockServices.mocks.authRepository.getAccessToken())
      .thenResolve(left(authError));
    // act
    const result = await act();
    // assert
    expect(result.payload).toStrictEqual(authError);
    verify(mockServices.mocks.authRepository.getAccessToken()).once();
  });

  describe('reducers', () => {
      it('should set loading to true if pending', () => {
        // arrange
        const action = {type: getAccessToken.pending.type};
        // act
        const result = authReducer(initialState, action);
        // assert
        expect(result).toStrictEqual({...initialState, loading: true});
      });

      it(
        `should set the access token and initialized to true, 
      and unset loading if fulfilled`,
        () => {
          // arrange
          const action = {
            type: getAccessToken.fulfilled.type,
            payload: accessToken
          };
          // act
          const result = authReducer(initialState, action);
          // assert
          expect(result).toStrictEqual({
            ...initialState,
            accessToken,
            initialized: true
          });
        },
      );

      it('should set the authError, and unset loading if rejected', () => {
        // arrange
        const action = {
          type: getAccessToken.rejected.type,
          payload: authError
        };
        // act
        const result = authReducer(initialState, action);
        // assert
        expect(result).toStrictEqual({...initialState, authError});
      });

      it(
        `should set initialized to true, and unset loading if rejected 
        with an unauthenticated error`,
        () => {
          // arrange
          const action = {
            type: getAccessToken.rejected.type,
            payload: AuthError.unauthenticated,
          };
          // act
          const result = authReducer(initialState, action);
          // assert
          expect(result).toStrictEqual({...initialState, initialized: true});
        });
    }
  );
});

describe('signOut thunk', () => {
  const act = () => signOut()(
    mockStore.dispatch,
    mockStore.getState,
    mockServices.instances,
  );

  it('should return the right action when fulfilled', async () => {
    when(mockServices.mocks.authRepository.signOut()).thenResolve(right(null));
    const result = await act();
    expect(result.payload).toBe(null);
    expect(result.type).toStrictEqual(signOut.fulfilled.type);
    verify(mockServices.mocks.authRepository.signOut()).once();
  });

  it('should return the right action when rejected', async () => {
    when(mockServices.mocks.authRepository.signOut()).thenResolve(left(authError));
    const result = await act();
    expect(result.payload).toBe(authError);
    expect(result.type).toStrictEqual(signOut.rejected.type);
    verify(mockServices.mocks.authRepository.signOut()).once();
  });

  describe('reducers', () => {
    const loggedInState: AuthState = {...initialState, authUser: authUser};

    it('should set loading to true if pending', () => {
      const action = {type: signOut.pending.type};
      const result = authReducer(loggedInState, action);
      expect(result).toStrictEqual({...loggedInState, loading: true});
    });

    it('should unset authUser and loading if fulfilled', () => {
      const action = {type: signOut.fulfilled};
      const result = authReducer({...loggedInState, loading: true}, action);
      expect(result).toStrictEqual({...loggedInState, authUser: null});
    });

    it('should unset loading and set authError if rejected', () => {
      const action = {type: signOut.rejected.type, payload: authError};
      const result = authReducer({...loggedInState, loading: true}, action);
      expect(result).toStrictEqual({...loggedInState, authError});
    });
  });
});
