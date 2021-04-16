/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ImTyping
// ====================================================

export interface ImTyping_typing {
  __typename: "Typing";
  conversationID: number;
}

export interface ImTyping {
  typing: ImTyping_typing;
}

export interface ImTypingVariables {
  conversationID: number;
  started: boolean;
}
