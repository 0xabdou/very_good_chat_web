import {Friendship, FriendshipInfo} from "../../types/friendship";
import {ApolloClient} from "@apollo/client";
import {
  GetFriendshipInfo,
  GetFriendshipInfoVariables
} from "../../../../_generated/GetFriendshipInfo";
import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  CANCEL_FRIEND_REQUEST_MUTATION,
  DECLINE_FRIEND_REQUEST_MUTATION,
  GET_FRIEND_REQUESTS,
  GET_FRIENDS,
  GET_FRIENDSHIP_INFO_QUERY,
  SEND_FRIEND_REQUEST_MUTATION,
  UNFRIEND_MUTATION
} from "../graphql";
import {
  SendFriendRequest,
  SendFriendRequestVariables
} from "../../../../_generated/SendFriendRequest";
import {
  AcceptFriendRequest,
  AcceptFriendRequestVariables
} from "../../../../_generated/AcceptFriendRequest";
import {
  DeclineFriendRequest,
  DeclineFriendRequestVariables
} from "../../../../_generated/DeclineFriendRequest";
import {
  CancelFriendRequest,
  CancelFriendRequestVariables
} from "../../../../_generated/CancelFriendRequest";
import {Unfriend, UnfriendVariables} from "../../../../_generated/Unfriend";
import {GetUserArgs} from "../../../user/types/user";
import {UserAPI} from "../../../user/data/sources/user-api";
import {FriendRequests} from "../../types/friend-request";
import {GetFriendRequests} from "../../../../_generated/GetFriendRequests";
import Friend from "../../types/friend";
import {GetFriends} from "../../../../_generated/GetFriends";

export interface IFriendAPI {

  getFriends(): Promise<Friend[]>

  getFriendRequests(): Promise<FriendRequests>;

  getFriendshipInfo(args: GetUserArgs): Promise<FriendshipInfo>;

  sendFriendRequest(userID: string): Promise<Friendship>;

  acceptFriendRequest(userID: string): Promise<Friendship>;

  declineFriendRequest(userID: string): Promise<Friendship>;

  cancelFriendRequest(userID: string): Promise<Friendship>;

  unfriend(userID: string): Promise<Friendship>;
}

export default class FriendAPI implements IFriendAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async getFriends(): Promise<Friend[]> {
    const {data} = await this._client.query<GetFriends>({
      query: GET_FRIENDS,
      fetchPolicy: 'no-cache'
    });
    return data.getFriends.map(friend => {
      return {
        user: UserAPI.parseUser(friend.user),
        date: friend.date
      };
    });
  }

  async getFriendRequests(): Promise<FriendRequests> {
    const {data} = await this._client.query<GetFriendRequests>({
      query: GET_FRIEND_REQUESTS,
      fetchPolicy: 'no-cache'
    });

    const requests = data.getFriendRequests;
    return {
      sent: requests.sent.map(r => ({
        user: UserAPI.parseUser(r.user),
        date: r.date,
      })),
      received: requests.received.map(r => ({
        user: UserAPI.parseUser(r.user),
        date: r.date,
      })),
    };
  }

  async getFriendshipInfo(args: GetUserArgs): Promise<FriendshipInfo> {
    const {data} = await this._client.query<GetFriendshipInfo, GetFriendshipInfoVariables>({
      query: GET_FRIENDSHIP_INFO_QUERY,
      variables: args,
      fetchPolicy: 'no-cache',
    });
    return {
      ...data.getFriendshipInfo,
      user: UserAPI.parseUser(data.getFriendshipInfo.user)
    };
  }

  async sendFriendRequest(userID: string): Promise<Friendship> {
    const {data} = await this._client.mutate<SendFriendRequest, SendFriendRequestVariables>({
      mutation: SEND_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    });

    return data!.sendFriendRequest;
  }

  async acceptFriendRequest(userID: string): Promise<Friendship> {
    const {data} = await this._client.mutate<AcceptFriendRequest, AcceptFriendRequestVariables>({
      mutation: ACCEPT_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    });

    return data!.acceptFriendRequest;
  }

  async declineFriendRequest(userID: string): Promise<Friendship> {
    const {data} = await this._client.mutate<DeclineFriendRequest, DeclineFriendRequestVariables>({
      mutation: DECLINE_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    });

    return data!.declineFriendRequest;
  }

  async cancelFriendRequest(userID: string): Promise<Friendship> {
    const {data} = await this._client.mutate<CancelFriendRequest, CancelFriendRequestVariables>({
      mutation: CANCEL_FRIEND_REQUEST_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    });

    return data!.cancelFriendRequest;
  }

  async unfriend(userID: string): Promise<Friendship> {
    const {data} = await this._client.mutate<Unfriend, UnfriendVariables>({
      mutation: UNFRIEND_MUTATION,
      variables: {userID},
      fetchPolicy: 'no-cache',
    });

    return data!.unfriend;
  }
}