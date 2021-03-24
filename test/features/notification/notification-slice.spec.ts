import {getMockStore, mockRANotification} from "../../mock-objects";
import StoreExtraArg from "../../../src/store/store-extra-arg";
import {instance, mock, when} from "ts-mockito";
import {INotificationRepository} from "../../../src/features/notification/data/notification-repository";
import reducer, {
  initialNotificationState,
  notificationActions,
  NotificationState
} from "../../../src/features/notification/notification-slice";
import {left, right} from "fp-ts/Either";
import {NotificationError} from "../../../src/features/notification/types/notification-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {Notification} from "../../../src/features/notification/types/notification";

const MockNotificationRepository = mock<INotificationRepository>();
const mockStore = getMockStore()();
const extra = {
  notificationRepo: instance(MockNotificationRepository)
} as StoreExtraArg;

const {getNotifications} = notificationActions;

describe('getNotifications', () => {
  const act = () => getNotifications()(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockNotificationRepository.getNotifications())
      .thenResolve(right([mockRANotification]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getNotifications.fulfilled.type);
    expect(result.payload).toStrictEqual([mockRANotification]);
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockNotificationRepository.getNotifications())
      .thenResolve(left(NotificationError.general));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getNotifications.rejected.type);
    expect(result.payload).toStrictEqual(NotificationError.general);
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const action: PayloadAction = {
        type: getNotifications.pending.type,
        payload: undefined
      };
      const state: NotificationState = {
        ...initialNotificationState,
        error: NotificationError.network
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({...state, error: null});
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const action: PayloadAction<Notification[]> = {
        type: getNotifications.fulfilled.type,
        payload: [mockRANotification]
      };
      const state: NotificationState = {...initialNotificationState};
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({
        ...state,
        notifications: [mockRANotification]
      });
    });

    it('should return the right state if rejected', () => {
      // arrange
      const action: PayloadAction<NotificationError> = {
        type: getNotifications.rejected.type,
        payload: NotificationError.network
      };
      const state: NotificationState = {...initialNotificationState};
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual({
        ...state,
        error: NotificationError.network
      });
    });
  });
});