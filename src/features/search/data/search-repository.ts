import User from "../../user/types/user";
import {IUserAPI} from "../../user/data/sources/user-api";
import {Either, left, right} from "fp-ts/Either";
import {SearchError} from "../types/search-error";
import {isApolloError} from "@apollo/client";

export interface ISearchRepository {
  findUsers(searchQuery: string): Promise<Either<SearchError, User[]>>;
}

export class SearchRepository implements ISearchRepository {

  private _userAPI: IUserAPI;

  constructor(userAPI: IUserAPI) {
    this._userAPI = userAPI;
  }

  findUsers(searchQuery: string) {
    return this._leftOrRight(() => this._userAPI.findUsers(searchQuery));
  }

  async _leftOrRight<R>(work: () => Promise<R>)
    : Promise<Either<SearchError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log(e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(SearchError.network);
        }
      }
      return left(SearchError.general);
    }
  }
}