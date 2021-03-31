import React from "react";
import {AppState, AppStore} from "../../../../src/store/store";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter, Route} from "react-router-dom";
import {FriendsActionsContext} from "../../../../src/features/friend/friends-actions-context";
import {instance, mock, reset, when} from "ts-mockito";
import {
  friendsActions,
  FriendsState,
  initialFriendsState
} from "../../../../src/features/friend/friends-slice";
import {getMockStore, mockFriend} from "../../../mock-objects";
import FriendError from "../../../../src/features/friend/types/friend-error";
import {BadgeActionsContext} from "../../../../src/features/badge/badge-actions-context";
import {badgeActions} from "../../../../src/features/badge/badge-slice";
import FriendsScreen from "../../../../src/features/friend/ui/friends-screen";

const MockStore = getMockStore();
const MockFriendsActions = mock<typeof friendsActions>();
const MockBadgeActions = mock<typeof badgeActions>();
const action = {type: 'getFriends'} as any;
const mockFriends = [mockFriend];
const loadedState: FriendsState = {
  ...initialFriendsState,
  friends: mockFriends
};
const emptyState: FriendsState = {
  ...initialFriendsState,
  friends: [],
};
const errorState: FriendsState = {
  ...initialFriendsState,
  friendsError: FriendError.network
};

jest.mock(
  'react-virtualized-auto-sizer',
  () => ({children}: any) => children({height: 600, width: 600})
);

const renderIt = (store: AppStore) => {
  const path = '/friends';
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]} initialIndex={0}>
        <Route path={path}>
          <FriendsActionsContext.Provider value={instance(MockFriendsActions)}>
            <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
              <FriendsScreen/>
            </BadgeActionsContext.Provider>
          </FriendsActionsContext.Provider>
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  reset(MockFriendsActions);
  when(MockFriendsActions.getFriends()).thenReturn(action);
});


it('should have "Friends" as a header', () => {
  // arrange
  const mockStore = MockStore({friends: initialFriendsState} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByText('Friends')).toBeInTheDocument();
});

it('should display a loader if loading', () => {
  // arrange
  const mockStore = MockStore({friends: initialFriendsState} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('friends-loading')).toBeInTheDocument();
});

it('should display some text if there are no friends', () => {
  // arrange
  const mockStore = MockStore({friends: emptyState} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('no-friends')).toBeInTheDocument();
});

it('should display a retry button if there is an error and no friends', () => {
  // arrange
  const mockStore = MockStore({friends: errorState} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('retry-button')).toBeInTheDocument();
});

it('should display requests', () => {
  // arrange
  const mockStore = MockStore({friends: loadedState} as AppState);
  // render
  renderIt(mockStore);
  // assert
  const items = screen.getAllByTestId('friend-list-item');
  expect(items).toHaveLength(mockFriends.length);
  expect(screen.getByText(mockFriends[0].user.username)).toBeInTheDocument();
});