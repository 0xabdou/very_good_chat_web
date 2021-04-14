/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {MediaType} from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMoreMessages
// ====================================================

export interface GetMoreMessages_getMoreMessages_medias {
  __typename: "Media";
  url: string;
  thumbUrl: string | null;
  type: MediaType;
}

export interface GetMoreMessages_getMoreMessages_deliveredTo {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface GetMoreMessages_getMoreMessages_seenBy {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface GetMoreMessages_getMoreMessages {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: GetMoreMessages_getMoreMessages_medias[] | null;
  sentAt: any;
  deliveredTo: GetMoreMessages_getMoreMessages_deliveredTo[];
  seenBy: GetMoreMessages_getMoreMessages_seenBy[];
}

export interface GetMoreMessages {
  getMoreMessages: GetMoreMessages_getMoreMessages[];
}

export interface GetMoreMessagesVariables {
  conversationID: number;
  messageID: number;
}
