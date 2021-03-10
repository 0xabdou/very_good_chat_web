import {AxiosInstance, AxiosResponse} from "axios";
import {deepEqual, instance, mock, reset, verify, when} from "ts-mockito";
import {ApolloClient} from "@apollo/client";
import {AuthAPI} from "../../../../../src/features/auth/data/sources/auth-api";
import {beforeEach, describe} from "@jest/globals";
import {LOGIN_WITH_GOOGLE} from "../../../../../src/features/auth/data/graphql";
import {
  LoginWithGoogleMutation,
  LoginWithGoogleMutation_loginWithGoogle_authUser,
  LoginWithGoogleMutationVariables
} from "../../../../../src/_generated/LoginWithGoogleMutation";
import LoginResult from "../../../../../src/features/auth/types/login-result";

const MockApolloClient = mock<ApolloClient<any>>();
const MockAxios = mock<AxiosInstance>();

const authApi = new AuthAPI(instance(MockApolloClient), instance(MockAxios));

beforeEach(() => {
  reset(MockApolloClient);
  reset(MockAxios);
});

describe('signInWithGoogle', () => {
  const googleToken = 'some_random_token';
  const accessToken = 'some_access_token';
  const authUser: LoginWithGoogleMutation_loginWithGoogle_authUser = {
    __typename: "AuthUser",
    displayName: 'Display Name',
    photoUrl: null,
  };
  const mutationVariables = {loginWithGoogleInput: {token: googleToken}};

  it('should return an AuthUser on success', async () => {
    // arrange
    when(MockApolloClient.mutate<LoginWithGoogleMutation, LoginWithGoogleMutationVariables>(
      deepEqual({
        mutation: LOGIN_WITH_GOOGLE,
        variables: mutationVariables,
      })))
      .thenResolve({
        data: {
          loginWithGoogle: {
            __typename: "LoginResponse",
            accessToken,
            authUser,
          }
        }
      });
    // act
    const res = await authApi.signInWihGoogle(googleToken);
    // assert
    verify(MockApolloClient.mutate(deepEqual({
      mutation: LOGIN_WITH_GOOGLE,
      variables: {loginWithGoogleInput: {token: googleToken}},
    }))).once();
    const expected: LoginResult = {
      accessToken: accessToken,
      displayName: authUser.displayName,
      photoURL: authUser.photoUrl,
    };
    expect(res).toStrictEqual(expected);
  });
});

describe("getAccessToken", () => {
  it('should return the access token on success', async () => {
    // arrange
    const accessToken = 'some_weird_token';
    when(MockAxios.get('auth/refresh_token')).thenResolve({
      data: {accessToken},
    } as AxiosResponse);
    // act
    const result = await authApi.getAccessToken();
    // assert
    verify(MockAxios.get('auth/refresh_token')).once();
    expect(result).toStrictEqual(accessToken);
  });
});

describe('logout', () => {
  it('should send a logout request', async () => {
    // arrange
    when(MockAxios.get('auth/logout')).thenResolve({} as AxiosResponse);
    // act
    await authApi.logout();
    // assert
    verify(MockAxios.get('auth/logout')).once();
  });
});