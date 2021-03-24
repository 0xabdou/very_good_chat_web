/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SendFriendRequest
// ====================================================

export interface SendFriendRequest_sendFriendRequest {
  __typename: "Friendship";
  date: any | null;
  status: FriendshipStatus;
}

export interface SendFriendRequest {
  sendFriendRequest: SendFriendRequest_sendFriendRequest;
}

export interface SendFriendRequestVariables {
  userID: string;
}
