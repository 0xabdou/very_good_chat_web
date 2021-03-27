/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockMutation
// ====================================================

export interface BlockMutation_block_user {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface BlockMutation_block {
  __typename: "Block";
  user: BlockMutation_block_user;
  date: any;
}

export interface BlockMutation {
  block: BlockMutation_block;
}

export interface BlockMutationVariables {
  blockedID: string;
}
