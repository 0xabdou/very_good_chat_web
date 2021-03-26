import User from "../../user/types/user";

export enum NotificationType {
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  SYSTEM = 'SYSTEM'
}

export type Notification = {
  id: number,
  // date is a number to make it serializable :(
  date: number,
  seen: boolean,
  content: NotificationContent
}

export type NotificationContent =
  RequestAcceptedNotification
  | SystemNotification;

export type RequestAcceptedNotification = {
  type: NotificationType.REQUEST_ACCEPTED,
  user: User
};

export const isRequestAcceptedNotification = (content: NotificationContent)
  : content is RequestAcceptedNotification => {
  return content.type == NotificationType.REQUEST_ACCEPTED;
};

export type SystemNotification = {
  type: NotificationType.SYSTEM,
  message: string
}

export const isSystemNotification = (content: NotificationContent)
  : content is SystemNotification => {
  return content.type == NotificationType.SYSTEM;
};