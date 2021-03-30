/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeQuery
// ====================================================

export interface MeQuery_me_user {
  __typename: "User";
  id: string;
  name: string | null;
  username: string;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface MeQuery_me {
  __typename: "Me";
  user: MeQuery_me_user;
  activeStatus: boolean;
}

export interface MeQuery {
  me: MeQuery_me;
}
