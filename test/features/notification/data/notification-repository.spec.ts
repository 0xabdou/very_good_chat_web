import {instance, mock, when} from "ts-mockito";
import {INotificationAPI} from "../../../../src/features/notification/data/sources/notification-api";
import NotificationRepository
  from "../../../../src/features/notification/data/notification-repository";
import {expect, it} from "@jest/globals";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import {NotificationError} from "../../../../src/features/notification/types/notification-error";
import {mockRANotification} from "../../../mock-objects";

const MockNotificationAPI = mock<INotificationAPI>();

const notificationRepo = new NotificationRepository(instance(MockNotificationAPI));

describe('error catching', () => {
  const act = (error: Error) => {
    return notificationRepo._leftOrRight(() => {
      throw error;
    });
  };

  it('should return network errors', async () => {
    // arrange
    const networkError = new ApolloError({errorMessage: 'LOL'});
    // act
    const result = await act(networkError);
    // assert
    expect(result).toStrictEqual(left(NotificationError.network));
  });

  it('should return general errors', async () => {
    // arrange
    const generalError = new Error('LMAO');
    // act
    const result = await act(generalError);
    // assert
    expect(result).toStrictEqual(left(NotificationError.general));
  });
});

describe('getNotifications', () => {
  it('should return notifications', async () => {
    // arrange
    when(MockNotificationAPI.getNotifications()).thenResolve([mockRANotification]);
    // act
    const result = await notificationRepo.getNotifications();
    // assert
    expect(result).toStrictEqual(right([mockRANotification]));
  });
});