import {getMockStore, mockRANotification, mockUser} from "../../mock-objects";
import StoreExtraArg from "../../../src/core/redux/store-extra-arg";
import {anything, instance, mock, when} from "ts-mockito";
import {INotificationRepository} from "../../../src/features/notification/data/notification-repository";
import reducer, {
  initialNotificationState,
  notificationActions,
  NotificationState
} from "../../../src/features/notification/notification-slice";
import {left, right} from "fp-ts/Either";
import NotificationError
  from "../../../src/features/notification/types/notification-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {
  Notification,
  NotificationType
} from "../../../src/features/notification/types/notification";

const MockNotificationRepository = mock<INotificationRepository>();
const mockStore = getMockStore()();
const extra = {
  notificationRepo: instance(MockNotificationRepository)
} as StoreExtraArg;

const {getNotifications, markNotificationAsSeen} = notificationActions;

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

describe('markNotificationAsSeen', () => {
  const notificationID = 4356;
  const act = () => markNotificationAsSeen(notificationID)(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockNotificationRepository.markNotificationAsSeen(anything()))
      .thenResolve(right(true));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(markNotificationAsSeen.fulfilled.type);
    expect(result.payload).toBe(true);
  });

  it('should return the right action if rejected', async () => {
    // arrange
    when(MockNotificationRepository.markNotificationAsSeen(anything()))
      .thenResolve(left(NotificationError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(markNotificationAsSeen.rejected.type);
    expect(result.payload).toBe(NotificationError.network);
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const notificationsBefore: Notification[] = [
        {
          id: 1,
          seen: false,
          date: new Date().getTime(),
          content: {
            type: NotificationType.SYSTEM,
            message: 'whatever'
          }
        },
        {
          id: 2,
          seen: false,
          date: new Date().getTime(),
          content: {
            type: NotificationType.REQUEST_ACCEPTED,
            user: mockUser
          }
        },
        {
          id: 3,
          seen: false,
          date: new Date().getTime(),
          content: {
            type: NotificationType.REQUEST_ACCEPTED,
            user: mockUser
          }
        }
      ];
      const notificationID = notificationsBefore[1].id;
      const notificationsAfter = notificationsBefore.map(n => {
        if (n.id == notificationID) return {...n, seen: true};
        return n;
      });
      const state: NotificationState = {
        ...initialNotificationState,
        notifications: notificationsBefore
      };
      const action: PayloadAction<void, string, { arg: number }> = {
        type: markNotificationAsSeen.pending.type,
        payload: undefined,
        meta: {arg: notificationID}
      };
      // act
      const result = reducer(state, action);
      expect(result).toStrictEqual({
        ...state,
        notifications: notificationsAfter
      });
    });
  });
});