/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SubscribeToTypings
// ====================================================

export interface SubscribeToTypings_typings {
  __typename: "Typing";
  conversationID: number;
  userID: string;
  started: boolean;
}

export interface SubscribeToTypings {
  typings: SubscribeToTypings_typings;
}
