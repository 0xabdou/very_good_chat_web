/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FriendshipStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetFriendshipInfo
// ====================================================

export interface GetFriendshipInfo_getFriendshipInfo_user {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface GetFriendshipInfo_getFriendshipInfo_friendship {
  __typename: "Friendship";
  status: FriendshipStatus;
  date: any | null;
}

export interface GetFriendshipInfo_getFriendshipInfo {
  __typename: "FriendshipInfo";
  user: GetFriendshipInfo_getFriendshipInfo_user;
  friendship: GetFriendshipInfo_getFriendshipInfo_friendship;
}

export interface GetFriendshipInfo {
  getFriendshipInfo: GetFriendshipInfo_getFriendshipInfo;
}

export interface GetFriendshipInfoVariables {
  userID?: string | null;
  username?: string | null;
}
