import {GoogleAuth} from "./sources/google-auth";
import {Either, left, right} from "fp-ts/Either";
import LoginResult from "../types/login-result";
import {IAuthAPI} from "./sources/auth-api";
import AuthError from "../types/auth-error";
import axios from "axios";


export default interface IAuthRepository {
  getAccessToken(): Promise<Either<AuthError, string>>;

  signInWithGoogle(): Promise<Either<AuthError, LoginResult>>;

  signOut(): Promise<Either<AuthError, null>>;
}

export class AuthRepository implements IAuthRepository {
  public static ERROR_COOKIES = 'idpiframe_initialization_failed';
  public static ERROR_ABORTED = 'popup_closed_by_user';
  public static ERROR_NETWORK = 'network_error';

  private _authAPI: IAuthAPI;
  private _googleAuth: GoogleAuth;

  constructor(
    authAPI: IAuthAPI,
    googleAuth: GoogleAuth,
  ) {
    this._authAPI = authAPI;
    this._googleAuth = googleAuth;
  }

  getAccessToken(): Promise<Either<AuthError, string>> {
    return this.leftOrRight<string>(async () => {
      return this._authAPI.getAccessToken();
    });
  }

  async signInWithGoogle(): Promise<Either<AuthError, LoginResult>> {
    return this.leftOrRight<LoginResult>(async () => {
      const token = await this._googleAuth.signIn();
      return this._authAPI.signInWihGoogle(token);
    });
  }

  async signOut(): Promise<Either<AuthError, null>> {
    return this.leftOrRight<null>(async () => {
      return this._authAPI.logout();
    });
  }

  async leftOrRight<R>(work: () => Promise<R>): Promise<Either<AuthError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log('AuthRepo THREW: ', e);
      if (axios.isAxiosError(e)) {
        if (e.response) {
          if (e.response.status == 401)
            return left(AuthError.unauthenticated);
          return left(AuthError.general);
        }
      }
      if (typeof e.error === 'string') {
        // Google sign in error
        switch (e.error) {
          case AuthRepository.ERROR_COOKIES:
            return left(AuthError.cookiesDisabled);
          case AuthRepository.ERROR_ABORTED:
            return left(AuthError.abortedByUser);
          case AuthRepository.ERROR_NETWORK:
            return left(AuthError.network);
        }
      }
      return left(AuthError.general);
    }
  }
}

