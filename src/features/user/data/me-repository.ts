import {Either, left, right} from "fp-ts/Either";
import UserError from "../types/user-error";
import {Me, UserCreation, UserUpdate} from "../types/user";
import {IUserAPI} from "./sources/user-api";
import {isApolloError} from "@apollo/client";

export interface IMeRepository {
  getMe(): Promise<Either<UserError, Me>>;

  createMe(creation: UserCreation): Promise<Either<UserError, Me>>;

  updateMe(update: UserUpdate): Promise<Either<UserError, Me>>;
}

export class MeRepository implements IMeRepository {
  static ERROR_USER_NOT_FOUND = 'USER_NOT_FOUND';
  static ERROR_USERNAME_TAKEN = 'USERNAME_TAKEN';

  private _userApi: IUserAPI;

  constructor(userApi: IUserAPI) {
    this._userApi = userApi;
  }

  async getMe(): Promise<Either<UserError, Me>> {
    return this.leftOrRight(() => this._userApi.getMe());
  }

  createMe(creation: UserCreation): Promise<Either<UserError, Me>> {
    return this.leftOrRight(async () => {
      const taken = await this._userApi.isUsernameTaken(creation.username);
      if (taken) {
        const error = new Error('This username is taken');
        error.name = MeRepository.ERROR_USERNAME_TAKEN;
        throw error;
      }
      return this._userApi.createMe(creation);
    });
  }

  updateMe(update: UserUpdate): Promise<Either<UserError, Me>> {
    return this.leftOrRight(async () => {
      if (update.username) {
        const taken = await this._userApi.isUsernameTaken(update.username);
        if (taken) {
          const error = new Error('This username is taken');
          error.name = MeRepository.ERROR_USERNAME_TAKEN;
          throw error;
        }
      }
      return this._userApi.updateMe(update);
    });
  }

  async leftOrRight<R>(work: () => Promise<R>): Promise<Either<UserError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log(e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(UserError.network);
        }
        if (code == MeRepository.ERROR_USER_NOT_FOUND)
          return left(UserError.notFound);
      }
      if (e.name == MeRepository.ERROR_USERNAME_TAKEN)
        return left(UserError.usernameTaken);
      return left(UserError.general);
    }
  }
}