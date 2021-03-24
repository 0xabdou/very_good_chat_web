import React from 'react';
import {
  getMockStore,
  getMockUserActions,
  loggedInAuthState,
  mockUser,
  mockUserActionObjects
} from "../../../mock-objects";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../src/store/store";
import LoggedInScreen from "../../../../src/features/user/ui/logged-in-screen";
import {UserActionsContext} from "../../../../src/features/user/user-actions-context";
import {UserState} from "../../../../src/features/user/user-slice";
import UserError from "../../../../src/features/user/types/user-error";
import {MemoryRouter} from "react-router-dom";
import {initialSearchState} from "../../../../src/features/search/search-slice";
import {initialBadgeState} from "../../../../src/features/badge/badge-slice";
import {initialFriendsState} from "../../../../src/features/friend/friends-slice";

const mockUserActions = getMockUserActions();
const MockStore = getMockStore();

const initialUserState: UserState = {
  initialized: false,
  currentUser: null,
  updatingUser: false,
  error: null,
};
const initialState = {
  user: initialUserState,
  auth: loggedInAuthState,
  search: initialSearchState,
  badge: initialBadgeState
} as AppState;

const renderComponent = (mockStore: AppStore, path: string = '/') => {
  render(
    <Provider store={mockStore}>
      <UserActionsContext.Provider value={mockUserActions}>
        <MemoryRouter initialEntries={[path]} initialIndex={0}>
          <LoggedInScreen/>
        </MemoryRouter>
      </UserActionsContext.Provider>
    </Provider>
  );
};

test('Should dispatch getCurrentUser on render', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(mockUserActions.getCurrentUser).toBeCalledTimes(1);
  expect(mockStore.getActions()).toContain(mockUserActionObjects.getCurrentUser);
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
    user: {...initialUserState, error: UserError.network},
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
      user: {...initialUserState, initialized: true},
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
    user: {...initialUserState, initialized: true, currentUser: mockUser},
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
