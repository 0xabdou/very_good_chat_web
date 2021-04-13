/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {MediaType, SendMessageInput} from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage_medias {
  __typename: "Media";
  url: string;
  thumbUrl: string | null;
  type: MediaType;
}

export interface SendMessage_sendMessage_deliveredTo {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SendMessage_sendMessage_seenBy {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SendMessage_sendMessage {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: SendMessage_sendMessage_medias[] | null;
  sentAt: any;
  deliveredTo: SendMessage_sendMessage_deliveredTo[];
  seenBy: SendMessage_sendMessage_seenBy[];
}

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  message: SendMessageInput;
}
