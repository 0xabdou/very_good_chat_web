import {
  getMockStore,
  getMockUserActions,
  initialUserState,
  mockUser
} from "../../../mock-objects";
import {instance, mock} from "ts-mockito";
import {
  IPhotoUtils,
  PhotoUtilsContext
} from "../../../../src/utils/photo-utils";
import {AppState, AppStore} from "../../../../src/store/store";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {UserActionsContext} from "../../../../src/features/user/user-actions-context";
import {beforeEach} from "@jest/globals";
import React from "react";
import ProfileScreen from "../../../../src/features/user/ui/profile-screen";
import {initialFriendsState} from "../../../../src/features/friend/friends-slice";
import UserError from "../../../../src/features/user/types/user-error";

let mockUserActions = getMockUserActions();
const MockStore = getMockStore();
const MockPhotoUtils = mock<IPhotoUtils>();

const initialState = {
  user: initialUserState,
  friends: initialFriendsState
} as AppState;

const renderIt = (mockStore: AppStore,) => {
  render(
    <PhotoUtilsContext.Provider value={instance(MockPhotoUtils)}>
      <Provider store={mockStore}>
        <UserActionsContext.Provider value={mockUserActions}>
          <ProfileScreen/>
        </UserActionsContext.Provider>
      </Provider>
    </PhotoUtilsContext.Provider>
  );
};

beforeEach(() => {
  mockUserActions = getMockUserActions();
});

it('should display a fullscreen loader if the state is not initialized', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
});

it('should display a retry page if the there is an error and no user', () => {
  // arrange
  const mockStore = MockStore({
    ...initialState,
    user: {
      ...initialUserState,
      initialized: true,
      error: UserError.general
    }
  });
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('retry-button')).toBeInTheDocument();
});

it('should display all required components if there is a user', () => {
  // arrange
  const mockStore = MockStore({
    ...initialState,
    user: {
      ...initialUserState,
      currentUser: mockUser,
      initialized: true
    }
  });
  // render
  renderIt(mockStore);
  // assert
  // Profile title
  expect(screen.getByText('Profile')).toBeInTheDocument();
  // Edit profile button
  expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
  // Settings button
  expect(screen.getByTestId('settings-button')).toBeInTheDocument();
  // Common profile info
  expect(screen.getByTestId('common-profile-info')).toBeInTheDocument();
  // Friends button
  expect(screen.getByTestId('friends-button')).toBeInTheDocument();
});
