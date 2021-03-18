/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CancelFriendRequest
// ====================================================

export interface CancelFriendRequest_cancelFriendRequest {
  __typename: "Friendship";
  date: any | null;
  status: FriendshipStatus;
}

export interface CancelFriendRequest {
  cancelFriendRequest: CancelFriendRequest_cancelFriendRequest;
}

export interface CancelFriendRequestVariables {
  userID: string;
}
