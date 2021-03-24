import {Notification, NotificationContent} from "../../types/notification";
import {ApolloClient} from "@apollo/client";
import {
  GetNotifications,
  GetNotifications_getNotifications
} from "../../../../_generated/GetNotifications";
import {GET_NOTIFICATIONS_QUERY} from "../graphql";
import {NotificationType} from "../../../../_generated/globalTypes";
import {UserAPI} from "../../../user/data/sources/user-api";

export interface INotificationAPI {
  getNotifications(): Promise<Notification[]>;
}

export default class NotificationAPI implements INotificationAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async getNotifications(): Promise<Notification[]> {
    const {data} = await this._client.query<GetNotifications>({
      query: GET_NOTIFICATIONS_QUERY,
      fetchPolicy: 'no-cache'
    });

    return data.getNotifications.map(n => {
      return {
        id: n.id,
        date: n.date,
        seen: n.seen,
        content: NotificationAPI._parseContent(n)
      };
    });
  }

  static _parseContent(notification: GetNotifications_getNotifications): NotificationContent {
    switch (notification.type) {
      case NotificationType.REQUEST_ACCEPTED:
        return {
          type: notification.type,
          user: UserAPI.parseUser(notification.friend!)
        };
      case NotificationType.SYSTEM:
        return {
          type: notification.type,
          message: 'some system message'
        };
    }
  }
}