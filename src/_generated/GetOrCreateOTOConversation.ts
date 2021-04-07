/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MediaType, ConversationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: GetOrCreateOTOConversation
// ====================================================

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation_participants {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_medias {
  __typename: "Media";
  url: string;
  type: MediaType;
}

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_deliveredTo {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_seenBy {
  __typename: "Delivery";
  userID: string;
  date: any;
}

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages {
  __typename: "Message";
  id: number;
  conversationID: number;
  senderID: string;
  text: string | null;
  medias: GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_medias[] | null;
  sentAt: any;
  deliveredTo: GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_deliveredTo[];
  seenBy: GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages_seenBy[];
}

export interface GetOrCreateOTOConversation_getOrCreateOneToOneConversation {
  __typename: "Conversation";
  id: number;
  participants: GetOrCreateOTOConversation_getOrCreateOneToOneConversation_participants[];
  messages: GetOrCreateOTOConversation_getOrCreateOneToOneConversation_messages[];
  type: ConversationType;
}

export interface GetOrCreateOTOConversation {
  getOrCreateOneToOneConversation: GetOrCreateOTOConversation_getOrCreateOneToOneConversation;
}

export interface GetOrCreateOTOConversationVariables {
  userID: string;
}
