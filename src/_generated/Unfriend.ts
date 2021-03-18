/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: Unfriend
// ====================================================

export interface Unfriend_unfriend {
  __typename: "Friendship";
  date: any | null;
  status: FriendshipStatus;
}

export interface Unfriend {
  unfriend: Unfriend_unfriend;
}

export interface UnfriendVariables {
  userID: string;
}
