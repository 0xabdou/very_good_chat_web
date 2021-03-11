import {Either, left, right} from "fp-ts/Either";
import UserError from "../types/user-error";
import User, {UserCreation, UserUpdate} from "../types/user";
import {IUserAPI} from "./sources/user-api";
import {isApolloError} from "@apollo/client";

export interface IUserRepository {
  getCurrentUser(): Promise<Either<UserError, User>>;

  createUser(creation: UserCreation): Promise<Either<UserError, User>>;

  updateUser(update: UserUpdate): Promise<Either<UserError, User>>;
}

export class UserRepository implements IUserRepository {
  static ERROR_USER_NOT_FOUND = 'USER_NOT_FOUND';
  static ERROR_USERNAME_TAKEN = 'USERNAME_TAKEN';

  private _userApi: IUserAPI;

  constructor(userApi: IUserAPI) {
    this._userApi = userApi;
  }

  async getCurrentUser(): Promise<Either<UserError, User>> {
    return this.leftOrRight(() => this._userApi.getCurrentUser());
  }

  createUser(creation: UserCreation): Promise<Either<UserError, User>> {
    return this.leftOrRight(async () => {
      const taken = await this._userApi.isUsernameTaken(creation.username);
      if (taken) {
        const error = new Error('This username is taken');
        error.name = UserRepository.ERROR_USERNAME_TAKEN;
        throw error;
      }
      return this._userApi.createUser(creation);
    });
  }

  updateUser(update: UserUpdate): Promise<Either<UserError, User>> {
    return this.leftOrRight(async () => {
      if (update.username) {
        const taken = await this._userApi.isUsernameTaken(update.username);
        if (taken) {
          const error = new Error('This username is taken');
          error.name = UserRepository.ERROR_USERNAME_TAKEN;
          throw error;
        }
      }
      return this._userApi.updateUser(update);
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
        if (code == UserRepository.ERROR_USER_NOT_FOUND)
          return left(UserError.notFound);
      }
      if (e.name == UserRepository.ERROR_USERNAME_TAKEN)
        return left(UserError.usernameTaken);
      return left(UserError.general);
    }
  }


}