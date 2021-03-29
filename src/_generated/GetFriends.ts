/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFriends
// ====================================================

export interface GetFriends_getFriends_user {
  __typename: "User";
  id: string;
  name: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
  photoURLSource: string | null;
  username: string;
}

export interface GetFriends_getFriends {
  __typename: "Friend";
  user: GetFriends_getFriends_user;
  friendshipDate: any;
  lastSeen: any | null;
}

export interface GetFriends {
  getFriends: GetFriends_getFriends[];
}
