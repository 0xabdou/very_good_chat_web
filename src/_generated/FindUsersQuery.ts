/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FindUsersQuery
// ====================================================

export interface FindUsersQuery_findUsers {
  __typename: "User";
  id: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
  username: string;
}

export interface FindUsersQuery {
  findUsers: FindUsersQuery_findUsers[];
}

export interface FindUsersQueryVariables {
  findUsersSearchQuery: string;
}
