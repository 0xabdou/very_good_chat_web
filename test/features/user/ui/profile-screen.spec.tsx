import {getMockStore, initialMeState, mockMe,} from "../../../mock-objects";
import {instance, mock, reset} from "ts-mockito";
import {
  IPhotoUtils,
  PhotoUtilsContext
} from "../../../../src/utils/photo-utils";
import {AppState, AppStore} from "../../../../src/store/store";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MeActionsContext} from "../../../../src/features/user/me-actions-context";
import {beforeEach} from "@jest/globals";
import React from "react";
import ProfileScreen from "../../../../src/features/user/ui/profile-screen";
import {initialFriendsState} from "../../../../src/features/friend/friends-slice";
import UserError from "../../../../src/features/user/types/user-error";
import {meActions} from "../../../../src/features/user/me-slice";

let MockMeActions = mock<typeof meActions>();
const MockStore = getMockStore();
const MockPhotoUtils = mock<IPhotoUtils>();

const initialState = {
  me: initialMeState,
  friends: initialFriendsState
} as AppState;

const renderIt = (mockStore: AppStore,) => {
  render(
    <PhotoUtilsContext.Provider value={instance(MockPhotoUtils)}>
      <Provider store={mockStore}>
        <MeActionsContext.Provider value={instance(MockMeActions)}>
          <ProfileScreen/>
        </MeActionsContext.Provider>
      </Provider>
    </PhotoUtilsContext.Provider>
  );
};

beforeEach(() => {
  reset(MockMeActions);
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
    me: {
      ...initialMeState,
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
    me: {
      ...initialMeState,
      me: mockMe,
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
