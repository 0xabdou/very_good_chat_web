/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFriendRequests
// ====================================================

export interface GetFriendRequests_getFriendRequests_received_user {
  __typename: "User";
  id: string;
  name: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
  photoURLSource: string | null;
  username: string;
}

export interface GetFriendRequests_getFriendRequests_received {
  __typename: "FriendRequest";
  user: GetFriendRequests_getFriendRequests_received_user;
  date: any;
}

export interface GetFriendRequests_getFriendRequests_sent_user {
  __typename: "User";
  id: string;
  name: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
  photoURLSource: string | null;
  username: string;
}

export interface GetFriendRequests_getFriendRequests_sent {
  __typename: "FriendRequest";
  user: GetFriendRequests_getFriendRequests_sent_user;
  date: any;
}

export interface GetFriendRequests_getFriendRequests {
  __typename: "FriendRequests";
  received: GetFriendRequests_getFriendRequests_received[];
  sent: GetFriendRequests_getFriendRequests_sent[];
}

export interface GetFriendRequests {
  getFriendRequests: GetFriendRequests_getFriendRequests;
}
