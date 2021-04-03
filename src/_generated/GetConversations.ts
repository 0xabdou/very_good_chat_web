/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MediaType, ConversationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetConversations
// ====================================================

export interface GetConversations_getConversations_participants {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface GetConversations_getConversations_messages_medias {
  __typename: "Media";
  url: string;
  type: MediaType;
}

export interface GetConversations_getConversations_messages {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: GetConversations_getConversations_messages_medias[] | null;
  sentAt: any;
}

export interface GetConversations_getConversations {
  __typename: "Conversation";
  id: number;
  participants: GetConversations_getConversations_participants[];
  messages: GetConversations_getConversations_messages[];
  type: ConversationType;
}

export interface GetConversations {
  getConversations: GetConversations_getConversations[];
}
