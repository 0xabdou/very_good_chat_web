/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: DeclineFriendRequest
// ====================================================

export interface DeclineFriendRequest_declineFriendRequest {
  __typename: "Friendship";
  date: any | null;
  status: FriendshipStatus;
}

export interface DeclineFriendRequest {
  declineFriendRequest: DeclineFriendRequest_declineFriendRequest;
}

export interface DeclineFriendRequestVariables {
  userID: string;
}
