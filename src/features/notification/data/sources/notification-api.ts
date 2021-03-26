import {Notification, NotificationContent} from "../../types/notification";
import {ApolloClient} from "@apollo/client";
import {
  GetNotifications,
  GetNotifications_getNotifications
} from "../../../../_generated/GetNotifications";
import {GET_NOTIFICATIONS_QUERY, MARK_NOTIFICATION_AS_SEEN} from "../graphql";
import {NotificationType} from "../../../../_generated/globalTypes";
import {UserAPI} from "../../../user/data/sources/user-api";
import {
  MarkNotificationAsSeen,
  MarkNotificationAsSeenVariables
} from "../../../../_generated/MarkNotificationAsSeen";

export interface INotificationAPI {
  getNotifications(): Promise<Notification[]>;

  markNotificationAsSeen(notificationID: number): Promise<boolean>;
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

  async markNotificationAsSeen(notificationID: number): Promise<boolean> {
    const {data} = await this._client.mutate<MarkNotificationAsSeen, MarkNotificationAsSeenVariables>
    ({
      mutation: MARK_NOTIFICATION_AS_SEEN,
      variables: {notificationID}
    });
    return data?.markNotificationAsSeen!;
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