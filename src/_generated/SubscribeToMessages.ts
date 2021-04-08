/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {MediaType} from "./globalTypes";

// ====================================================
// GraphQL subscription operation: SubscribeToMessages
// ====================================================

export interface SubscribeToMessages_subscribeToMessages_medias {
  __typename: "Media";
  url: string;
  type: MediaType;
}

export interface SubscribeToMessages_subscribeToMessages_deliveredTo {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SubscribeToMessages_subscribeToMessages_seenBy {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SubscribeToMessages_subscribeToMessages {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: SubscribeToMessages_subscribeToMessages_medias[] | null;
  sentAt: any;
  deliveredTo: SubscribeToMessages_subscribeToMessages_deliveredTo[];
  seenBy: SubscribeToMessages_subscribeToMessages_seenBy[];
}

export interface SubscribeToMessages {
  subscribeToMessages: SubscribeToMessages_subscribeToMessages;
}
