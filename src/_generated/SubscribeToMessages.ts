/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {MediaType} from "./globalTypes";

// ====================================================
// GraphQL subscription operation: SubscribeToMessages
// ====================================================

export interface SubscribeToMessages_messages_message_medias {
  __typename: "Media";
  url: string;
  type: MediaType;
}

export interface SubscribeToMessages_messages_message_deliveredTo {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SubscribeToMessages_messages_message_seenBy {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface SubscribeToMessages_messages_message {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: SubscribeToMessages_messages_message_medias[] | null;
  sentAt: any;
  deliveredTo: SubscribeToMessages_messages_message_deliveredTo[];
  seenBy: SubscribeToMessages_messages_message_seenBy[];
}

export interface SubscribeToMessages_messages {
  __typename: "MessageSub";
  message: SubscribeToMessages_messages_message;
  update: boolean | null;
}

export interface SubscribeToMessages {
  messages: SubscribeToMessages_messages;
}
