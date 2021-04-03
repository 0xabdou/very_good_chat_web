/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SendMessageInput, MediaType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage_medias {
  __typename: "Media";
  url: string;
  type: MediaType;
}

export interface SendMessage_sendMessage {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: SendMessage_sendMessage_medias[] | null;
  sentAt: any;
  deliveredTo: string[];
  seenBy: string[];
}

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  message: SendMessageInput;
}
