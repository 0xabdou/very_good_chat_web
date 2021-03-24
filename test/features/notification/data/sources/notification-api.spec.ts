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
import {GET_NOTIFICATIONS_QUERY} from "../../../../../src/features/notification/data/graphql";

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