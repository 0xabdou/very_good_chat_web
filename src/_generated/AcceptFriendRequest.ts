/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AcceptFriendRequest
// ====================================================

export interface AcceptFriendRequest_acceptFriendRequest {
  __typename: "Friendship";
  date: any | null;
  status: FriendshipStatus;
}

export interface AcceptFriendRequest {
  acceptFriendRequest: AcceptFriendRequest_acceptFriendRequest;
}

export interface AcceptFriendRequestVariables {
  userID: string;
}
