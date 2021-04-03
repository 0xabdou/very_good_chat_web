/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BadgeName {
  FRIEND_REQUESTS = "FRIEND_REQUESTS",
  NOTIFICATIONS = "NOTIFICATIONS",
}

export enum ConversationType {
  GROUP = "GROUP",
  ONE_TO_ONE = "ONE_TO_ONE",
}

export enum FriendshipStatus {
  BLOCKED = "BLOCKED",
  BLOCKING = "BLOCKING",
  FRIENDS = "FRIENDS",
  REQUEST_RECEIVED = "REQUEST_RECEIVED",
  REQUEST_SENT = "REQUEST_SENT",
  STRANGERS = "STRANGERS",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum NotificationType {
  REQUEST_ACCEPTED = "REQUEST_ACCEPTED",
  SYSTEM = "SYSTEM",
}

export interface LoginInput {
  token: string;
}

export interface SendMessageInput {
  conversationID: number;
  text?: string | null;
  medias?: any[] | null;
}

export interface UserCreation {
  username: string;
  name?: string | null;
  photo?: any | null;
}

export interface UserUpdate {
  username?: string | null;
  name?: string | null;
  deleteName?: boolean | null;
  photo?: any | null;
  deletePhoto?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
