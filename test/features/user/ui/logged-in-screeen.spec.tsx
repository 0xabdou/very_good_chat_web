import React from 'react';
import {getMockStore, loggedInAuthState, mockMe,} from "../../../mock-objects";
import {render, screen, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../src/core/redux/store";
import LoggedInScreen from "../../../../src/features/user/ui/logged-in-screen";
import {MeActionsContext} from "../../../../src/features/user/me-actions-context";
import {meActions, MeState} from "../../../../src/features/user/me-slice";
import UserError from "../../../../src/features/user/types/user-error";
import {MemoryRouter} from "react-router-dom";
import {initialSearchState} from "../../../../src/features/search/search-slice";
import {
  badgeActions,
  initialBadgeState
} from "../../../../src/features/badge/badge-slice";
import {
  friendsActions,
  initialFriendsState
} from "../../../../src/features/friend/friends-slice";
import {
  initialNotificationState,
  notificationActions
} from "../../../../src/features/notification/notification-slice";
import {instance, mock, resetCalls, verify, when} from "ts-mockito";
import {FriendsActionsContext} from "../../../../src/features/friend/friends-actions-context";
import {NotificationActionsContext} from '../../../../src/features/notification/notification-actions-context';
import {BadgeActionsContext} from '../../../../src/features/badge/badge-actions-context';
import {
  chatActions,
  initialChatState
} from "../../../../src/features/chat/chat-slice";
import {ChatActionsContext} from '../../../../src/features/chat/chat-actions-provider';

const MockMeActions = mock<typeof meActions>();
const MockFriendActions = mock<typeof friendsActions>();
const MockNotificationActions = mock<typeof notificationActions>();
const MockBadgeActions = mock<typeof badgeActions>();
const MockChatActions = mock<typeof chatActions>();

const MockStore = getMockStore();
const meAction = {type: 'me'} as any;
const getConversationsAction = {type: 'convos'} as any;
const getFriendsAction = {type: 'friends'} as any;
const getFriendsReqsAction = {type: 'friend reqs'} as any;
const getNotificationsAction = {type: 'notification'} as any;
const getBadgesAction = {type: 'badges'} as any;
const updateLSAction = {type: 'last seen'} as any;
const subToMsgAction = {type: 'sub to msg'} as any;
const subToTypingsAction = {type: 'sub to typings'} as any;

const initialMeState: MeState = {
  initialized: false,
  me: null,
  updatingUser: false,
  error: null,
};
const initialState = {
  me: initialMeState,
  auth: loggedInAuthState,
  search: initialSearchState,
  badge: initialBadgeState,
  notification: initialNotificationState,
  chat: initialChatState
} as AppState;

const renderComponent = (mockStore: AppStore, path: string = '/') => {
  render(
    <Provider store={mockStore}>
      <MeActionsContext.Provider value={instance(MockMeActions)}>
        <FriendsActionsContext.Provider value={instance(MockFriendActions)}>
          <NotificationActionsContext.Provider
            value={instance(MockNotificationActions)}>
            <ChatActionsContext.Provider value={instance(MockChatActions)}>
              <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
                <MemoryRouter initialEntries={[path]} initialIndex={0}>
                  <LoggedInScreen/>
                </MemoryRouter>
              </BadgeActionsContext.Provider>
            </ChatActionsContext.Provider>
          </NotificationActionsContext.Provider>
        </FriendsActionsContext.Provider>
      </MeActionsContext.Provider>
    </Provider>
  );
};

beforeAll(() => {
  when(MockMeActions.getMe()).thenReturn(meAction);
  when(MockFriendActions.getFriends()).thenReturn(getFriendsAction);
  when(MockFriendActions.getFriendRequests()).thenReturn(getFriendsReqsAction);
  when(MockNotificationActions.getNotifications()).thenReturn(getNotificationsAction);
  when(MockBadgeActions.getBadges()).thenReturn(getBadgesAction);
  when(MockMeActions.updateLastSeen()).thenReturn(updateLSAction);
  when(MockChatActions.getConversations()).thenReturn(getConversationsAction);
  when(MockChatActions.subscribeToMessages()).thenReturn(subToMsgAction);
  when(MockChatActions.subscribeToTypings()).thenReturn(subToTypingsAction);
});

beforeEach(() => {
  resetCalls(MockMeActions);
});

test('Should dispatch all required actions on render', async () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  const actions = mockStore.getActions();
  verify(MockMeActions.getMe()).once();
  verify(MockChatActions.getConversations()).once();
  verify(MockBadgeActions.getBadges()).once();
  expect(actions[0]).toBe(meAction);
  expect(actions[1]).toBe(getConversationsAction);
  expect(actions[2]).toBe(subToMsgAction);
  expect(actions[3]).toBe(subToTypingsAction);
  expect(actions[4]).toBe(getBadgesAction);
  // polling
  await waitFor(() => verify(MockFriendActions.getFriendRequests()).once());
  verify(MockFriendActions.getFriends()).once();
  verify(MockNotificationActions.getNotifications()).once();
  expect(actions[5]).toBe(getFriendsReqsAction);
  expect(actions[6]).toBe(getFriendsAction);
  expect(actions[7]).toBe(getNotificationsAction);
  expect(actions[8]).toBe(updateLSAction);
  expect(actions).toHaveLength(9);
});

test('Should display a loader if the state is being initialized', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
  expect(screen.queryByTestId('retry-button')).toBeNull();
  expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test('Should display a retry button if there was an initialization error', () => {
  // arrange
  const errorState: AppState = {
    ...initialState,
    me: {...initialMeState, error: UserError.network},
  };
  const mockStore = MockStore(errorState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
  expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test(
  'Should display the registration screen if the state was initialized, ' +
  'but no user was logged in',
  () => {
    // arrange
    const registrationState: AppState = {
      ...initialState,
      me: {...initialMeState, initialized: true},
    };
    const mockStore = MockStore(registrationState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.getByTestId('profile-updating-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('main-screen')).toBeNull();
    expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
    expect(screen.queryByTestId('retry-button')).toBeNull();
  },
);

describe('When the state is initialized and a user is logged in', () => {
  const loggedInState: AppState = {
    ...initialState,
    me: {...initialMeState, initialized: true, me: mockMe},
    badge: initialBadgeState,
    friends: initialFriendsState
  };
  const mockTheStore = () => MockStore(loggedInState);

  test(
    'Should display the main screen if the path is "/"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore);
      // assert
      expect(screen.getByTestId('main-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );
  test(
    'Should display the profile screen if the path is "/profile"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore, '/profile');
      // assert
      expect(screen.getByTestId('profile-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );

  test(
    'Should display the profile updating screen if the path is "/edit-profile"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore, '/edit-profile');
      // assert
      expect(screen.getByTestId('profile-updating-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );
});
