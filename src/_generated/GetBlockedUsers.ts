/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBlockedUsers
// ====================================================

export interface GetBlockedUsers_getBlockedUsers_user {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface GetBlockedUsers_getBlockedUsers {
  __typename: "Block";
  user: GetBlockedUsers_getBlockedUsers_user;
  date: any;
}

export interface GetBlockedUsers {
  getBlockedUsers: GetBlockedUsers_getBlockedUsers[];
}
