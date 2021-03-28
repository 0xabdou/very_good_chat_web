import React from 'react';
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../../src/store/store";
import {anything, instance, mock, reset, when} from "ts-mockito";
import {badgeActions} from "../../../../../src/features/badge/badge-slice";
import {BadgeActionsContext} from "../../../../../src/features/badge/badge-actions-context";
import Badges from "../../../../../src/features/badge/ui/components/badges";
import {
  FriendsState,
  initialFriendsState
} from "../../../../../src/features/friend/friends-slice";
import {FriendRequest} from "../../../../../src/features/friend/types/friend-request";
import {getMockStore, mockUser} from "../../../../mock-objects";
import {MemoryRouter} from "react-router-dom";
import {initialNotificationState} from "../../../../../src/features/notification/notification-slice";
import {
  Notification,
  NotificationType
} from "../../../../../src/features/notification/types/notification";

const MockBadgeActions = mock<typeof badgeActions>();
const MockStore = getMockStore();
const action = {type: 'update'} as any;

const renderIt = (store: AppStore) => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
          <Badges/>
        </BadgeActionsContext.Provider>
      </MemoryRouter>
    </Provider>
  );
};

const present = new Date().getTime();
const past = present - 10000;
const future = present + 10000;

beforeEach(() => {
  reset(MockBadgeActions);
  when(MockBadgeActions.updateBadge(anything())).thenReturn(action);
});

describe('Requests badge', () => {
  const req1: FriendRequest = {
    user: {...mockUser, id: '1', username: '1'},
    date: future
  };
  const req2: FriendRequest = {
    user: {...mockUser, id: '2', username: '2'},
    date: future
  };
  const req3: FriendRequest = {
    user: {...mockUser, id: '3', username: '3'},
    date: past
  };
  const req4: FriendRequest = {
    user: {...mockUser, id: '4', username: '4'},
    date: past
  };
  it('should display the right number in the badge',
    async () => {
      // arrange
      const state = {
        badge: {
          friendRequests: present,
          notifications: present
        },
        friends: {
          friends: null,
          friendsError: null,
          friendRequests: {
            sent: [],
            // 2 requests in the past, 2 in the future
            received: [req1, req2, req3, req4],
          },
          requestsError: null,
          beingTreated: []
        } as FriendsState,
        notification: initialNotificationState
      } as AppState;
      const mockStore = MockStore(state);
      // render
      renderIt(mockStore);
      // assert
      // should display the number of requests in the future (2)
      expect(await screen.findByText('2')).toBeInTheDocument();
    },
  );
});

describe('Requests badge', () => {
  const notif1: Notification = {
    id: 1,
    seen: false,
    content: {
      type: NotificationType.REQUEST_ACCEPTED,
      user: mockUser
    },
    date: future
  };
  const notif2: Notification = {
    id: 2,
    seen: false,
    content: {
      type: NotificationType.SYSTEM,
      message: 'up'
    },
    date: future
  };
  const notif3: Notification = {
    id: 3,
    seen: false,
    content: {
      type: NotificationType.SYSTEM,
      message: 'up'
    },
    date: past
  };
  const notif4: Notification = {
    id: 4,
    seen: false,
    content: {
      type: NotificationType.REQUEST_ACCEPTED,
      user: mockUser
    },
    date: past
  };
  it('should display the right number in the badge',
    async () => {
      // arrange
      const state = {
        badge: {
          friendRequests: present,
          notifications: present
        },
        friends: initialFriendsState,
        notification: {
          ...initialNotificationState,
          notifications: [notif1, notif2, notif3, notif4]
        }
      } as AppState;
      const mockStore = MockStore(state);
      // render
      renderIt(mockStore);
      // assert
      // should display the number of requests in the future (2)
      expect(await screen.findByText('2')).toBeInTheDocument();
    },
  );
});