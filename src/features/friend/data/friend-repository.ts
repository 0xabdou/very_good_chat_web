import {Either, left, right} from "fp-ts/Either";
import FriendError from "../types/friend-error";
import {Friendship, FriendshipInfo} from "../types/friendship";
import {isApolloError} from "@apollo/client";
import {IFriendAPI} from "./sources/friend-api";

export interface IFriendRepository {
  getFriendshipInfo(userID: string):
    Promise<Either<FriendError, FriendshipInfo>>;

  sendFriendRequest(userID: string):
    Promise<Either<FriendError, Friendship>>;

  acceptFriendRequest(userID: string):
    Promise<Either<FriendError, Friendship>>;

  declineFriendRequest(userID: string):
    Promise<Either<FriendError, Friendship>>;

  cancelFriendRequest(userID: string):
    Promise<Either<FriendError, Friendship>>;

  unfriend(userID: string): Promise<Either<FriendError, Friendship>>;
}

export default class FriendRepository implements IFriendRepository {
  private readonly _friendAPI: IFriendAPI;

  constructor(friendAPI: IFriendAPI) {
    this._friendAPI = friendAPI;
  }

  getFriendshipInfo(userID: string): Promise<Either<FriendError, FriendshipInfo>> {
    return this._leftOrRight(() => this._friendAPI.getFriendshipInfo(userID));
  }

  sendFriendRequest(userID: string): Promise<Either<FriendError, Friendship>> {
    return this._leftOrRight(() => this._friendAPI.sendFriendRequest(userID));
  }

  acceptFriendRequest(userID: string): Promise<Either<FriendError, Friendship>> {
    return this._leftOrRight(() => this._friendAPI.acceptFriendRequest(userID));
  }

  declineFriendRequest(userID: string): Promise<Either<FriendError, Friendship>> {
    return this._leftOrRight(
      () => this._friendAPI.declineFriendRequest(userID)
    );
  }

  cancelFriendRequest(userID: string): Promise<Either<FriendError, Friendship>> {
    return this._leftOrRight(() => this._friendAPI.cancelFriendRequest(userID));
  }

  unfriend(userID: string): Promise<Either<FriendError, Friendship>> {
    return this._leftOrRight(() => this._friendAPI.unfriend(userID));
  }

  async _leftOrRight<R>(work: () => Promise<R>):
    Promise<Either<FriendError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log(e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(FriendError.network);
        }
      }
      return left(FriendError.general);
    }
  }
}