/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NotificationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetNotifications
// ====================================================

export interface GetNotifications_getNotifications_friend {
  __typename: "User";
  id: string;
  username: string;
  name: string | null;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface GetNotifications_getNotifications {
  __typename: "Notification";
  id: number;
  date: any;
  seen: boolean;
  type: NotificationType;
  friend: GetNotifications_getNotifications_friend | null;
}

export interface GetNotifications {
  getNotifications: GetNotifications_getNotifications[];
}
