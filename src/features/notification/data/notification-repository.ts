import {Either, left, right} from "fp-ts/Either";
import {NotificationError} from "../types/notification-error";
import {Notification} from "../types/notification";
import {INotificationAPI} from "./sources/notification-api";
import {isApolloError} from "@apollo/client";

export interface INotificationRepository {
  getNotifications(): Promise<Either<NotificationError, Notification[]>>;
}

export default class NotificationRepository implements INotificationRepository {
  private readonly _notificationAPI: INotificationAPI;

  constructor(notificationAPI: INotificationAPI) {
    this._notificationAPI = notificationAPI;
  }

  getNotifications(): Promise<Either<NotificationError, Notification[]>> {
    return this._leftOrRight(() => this._notificationAPI.getNotifications());
  }

  async _leftOrRight<R>(work: () => Promise<R>): Promise<Either<NotificationError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log('NotificationRepo THREW: ', e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(NotificationError.network);
        }
      }
      return left(NotificationError.general);
    }
  }
}