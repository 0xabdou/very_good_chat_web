import LoginResult from "../../types/login-result";
import {ApolloClient} from "@apollo/client";
import {
  LoginWithGoogleMutation,
  LoginWithGoogleMutationVariables
} from "../../../../_generated/LoginWithGoogleMutation";
import {LOGIN_WITH_GOOGLE} from "../graphql";
import {AxiosInstance} from "axios";

export interface IAuthAPI {
  signInWihGoogle(token: string): Promise<LoginResult>;

  getAccessToken(): Promise<string>;

  logout(): Promise<null>;
}

export class AuthAPI implements IAuthAPI {
  private _client: ApolloClient<any>;
  private _axios: AxiosInstance;

  constructor(client: ApolloClient<any>, axios: AxiosInstance) {
    this._client = client;
    this._axios = axios;
  }

  async signInWihGoogle(token: string): Promise<LoginResult> {
    const {data} = await this._client.mutate<LoginWithGoogleMutation,
      LoginWithGoogleMutationVariables>({
      mutation: LOGIN_WITH_GOOGLE,
      variables: {loginWithGoogleInput: {token}}
    });
    const result = data?.loginWithGoogle!;
    return {
      accessToken: result.accessToken,
      displayName: result.authUser.displayName,
      photoURL: result.authUser.photoUrl,
    };
  }

  async getAccessToken(): Promise<string> {
    const res = await this._axios.get('auth/refresh_token');
    return res.data.accessToken;
  }

  async logout(): Promise<null> {
    await this._axios.get('auth/logout');
    return null;
  }
}

export class FakeAuthAPI implements IAuthAPI {
  signInWihGoogle(token: string): Promise<LoginResult> {
    return new Promise<LoginResult>(resolve => {
      setTimeout(
        () => resolve({
          accessToken: 'some_access_token',
          displayName: null,
          photoURL: null
        }),
        1000
      );
    });
  }

  async getAccessToken(): Promise<string> {
    return 'access_token';
  }

  logout(): Promise<null> {
    return Promise.resolve(null);
  }
}