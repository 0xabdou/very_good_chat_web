import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import NotificationAPI
  from "../../../../../src/features/notification/data/sources/notification-api";
import {GetNotifications} from "../../../../../src/_generated/GetNotifications";
import {
  mockGQLRANotification,
  mockGQLSystemNotification,
  mockRANotification,
  mockSystemNotification
} from "../../../../mock-objects";
import {
  GET_NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_AS_SEEN
} from "../../../../../src/features/notification/data/graphql";
import {
  MarkNotificationAsSeen,
  MarkNotificationAsSeenVariables
} from "../../../../../src/_generated/MarkNotificationAsSeen";

const MockApolloClient = mock<ApolloClient<any>>();

const notificationAPI = new NotificationAPI(instance(MockApolloClient));


describe('parsing', () => {


  it('should parse RequestAccepted notification', function () {
    const result = NotificationAPI._parseContent(mockGQLRANotification);
    expect(result).toStrictEqual(mockRANotification.content);
  });

  it('should parse System notification', function () {
    const result = NotificationAPI._parseContent(mockGQLSystemNotification);
    expect(result).toStrictEqual(mockSystemNotification.content);
  });
});

describe('getNotifications', () => {
  it('should return notifications', async () => {
    // arrange
    when(MockApolloClient.query<GetNotifications>(anything())).thenResolve({
      data: {
        getNotifications: [mockGQLRANotification, mockGQLSystemNotification]
      }
    } as ApolloQueryResult<GetNotifications>);
    // act
    const result = await notificationAPI.getNotifications();
    // assert
    expect(result).toStrictEqual([mockRANotification, mockSystemNotification]);
    verify(MockApolloClient.query(deepEqual({query: GET_NOTIFICATIONS_QUERY})));
  });
});

describe('markNotificationAsSeen', () => {
  it('should mark the notification as seen', async () => {
    // arrange
    when(MockApolloClient.mutate<MarkNotificationAsSeen, MarkNotificationAsSeenVariables>(anything()))
      .thenResolve({
        data: {markNotificationAsSeen: true}
      } as ApolloQueryResult<MarkNotificationAsSeen>);
    const notificationID = 345678;
    // act
    const result = await notificationAPI.markNotificationAsSeen(notificationID);
    // assert
    expect(result).toBe(true);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: MARK_NOTIFICATION_AS_SEEN,
      variables: {notificationID}
    }))).once();
  });
});