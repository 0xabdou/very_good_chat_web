import React from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {AppState, AppStore} from "../../../../src/core/redux/store";
import {Provider} from "react-redux";
import {
  anything,
  instance,
  mock,
  reset,
  resetCalls,
  verify,
  when
} from "ts-mockito";
import {
  initialNotificationState,
  notificationActions,
  NotificationState
} from "../../../../src/features/notification/notification-slice";
import {NotificationActionsContext} from "../../../../src/features/notification/notification-actions-context";
import {MemoryRouter} from "react-router-dom";
import NotificationsScreen
  from "../../../../src/features/notification/ui/notifications-screen";
import {getMockStore, mockRANotification} from "../../../mock-objects";
import NotificationError
  from "../../../../src/features/notification/types/notification-error";
import {badgeActions} from "../../../../src/features/badge/badge-slice";
import {BadgeActionsContext} from "../../../../src/features/badge/badge-actions-context";
import {BadgeName} from "../../../../src/features/badge/types/badge";

const MockNotificationActions = mock<typeof notificationActions>();
const MockBadgeActions = mock<typeof badgeActions>();
const MockStore = getMockStore();
const updateBadgeAction = {type: 'update'} as any;

const renderIt = (store: AppStore) => {
  render(
    <Provider store={store}>
      <NotificationActionsContext.Provider
        value={instance(MockNotificationActions)}>
        <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
          <MemoryRouter initialEntries={['/notifications']} initialIndex={0}>
            <NotificationsScreen/>
          </MemoryRouter>
        </BadgeActionsContext.Provider>
      </NotificationActionsContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  resetCalls(MockNotificationActions);
  reset(MockBadgeActions);
  when(MockBadgeActions.updateBadge(anything())).thenReturn(updateBadgeAction);
});

it('should update the notifications badge', async () => {
  // arrange
  const state = {...initialNotificationState};
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  await waitFor(() => verify(MockBadgeActions.updateBadge(BadgeName.NOTIFICATIONS)).once());
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(updateBadgeAction);
});

it('should display a spinner while loading', () => {
  // arrange
  const state = {...initialNotificationState};
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('notifications-loading')).toBeInTheDocument();
});

it('should display a list of notifications if there are any', async () => {
  // arrange
  const state: NotificationState = {
    ...initialNotificationState,
    notifications: [mockRANotification]
  };
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(await screen.findAllByTestId('notification-list-item')).toHaveLength(1);
});

it('should display a message if there are no notifications', () => {
  // arrange
  const state: NotificationState = {
    ...initialNotificationState,
    notifications: []
  };
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
});

it('should display an error message if there was an error and no notifications', () => {
  // arrange
  const state: NotificationState = {
    ...initialNotificationState,
    error: NotificationError.network
  };
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('notifications-error')).toBeInTheDocument();
});

it('should dispatch markNotificationAsSeen after clicking on the list item', () => {
  // arrange
  const action = {type: 'any'} as any;
  when(MockNotificationActions.markNotificationAsSeen(anything()))
    .thenReturn(action);
  const state: NotificationState = {
    ...initialNotificationState,
    notifications: [mockRANotification]
  };
  const mockStore = MockStore({notification: state} as AppState);
  // render
  renderIt(mockStore);
  // click on a list item
  const item = screen.getByTestId('notification-list-item');
  fireEvent.click(item);
  verify(MockNotificationActions.markNotificationAsSeen(mockRANotification.id)).once();
  expect(mockStore.getActions()).toHaveLength(2);
  expect(mockStore.getActions()[1]).toBe(action);
});
