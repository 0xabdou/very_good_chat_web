/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeQuery
// ====================================================

export interface MeQuery_me {
  __typename: "User";
  id: string;
  name: string | null;
  photoURL: string | null;
  username: string;
}

export interface MeQuery {
  me: MeQuery_me;
}
