import React from "react";
import {AppState, AppStore} from "../../../../src/core/redux/store";
import {render, screen, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {FriendProfileActionsContext} from "../../../../src/features/friend/friend-profile-actions-context";
import {anything, instance, mock, reset, when} from "ts-mockito";
import {
  friendProfileActions,
  initialFriendProfileState
} from "../../../../src/features/friend/friend-profile-slice";
import {MemoryRouter, Route} from "react-router-dom";
import FriendProfileScreen
  from "../../../../src/features/friend/ui/friend-profile-screen";
import {getMockStore, mockFriendship, mockUser} from "../../../mock-objects";
import FriendError, {stringifyFriendError} from "../../../../src/features/friend/types/friend-error";

const MockFriendsActions = mock<typeof friendProfileActions>();
const MockStore = getMockStore();
const username = 'usernaaaaaame';
const action = {type: 'any'} as any;

const renderIt = (store: AppStore) => {
  render(
    <Provider store={store}>
      <FriendProfileActionsContext.Provider
        value={instance(MockFriendsActions)}>
        <MemoryRouter initialEntries={[`/u/${username}`]} initialIndex={0}>
          <Route path='/u/:username'>
            <FriendProfileScreen/>
          </Route>
        </MemoryRouter>
      </FriendProfileActionsContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  reset(MockFriendsActions);
  when(MockFriendsActions.getFriendshipInfo(anything()))
    .thenReturn(action);
  when(MockFriendsActions.reset())
    .thenReturn(action);
});

it('should render all the needed components (state user)', async () => {
  // arrange
  const action = {type: 'any'} as any;
  when(MockFriendsActions.getFriendshipInfo(anything()))
    .thenReturn(action);
  when(MockFriendsActions.reset())
    .thenReturn(action);
  const state = {
    friendProfile: {
      user: mockUser,
      friendship: mockFriendship,
      loading: false,
      modifyingFriendship: false,
      error: null
    },
    search: {results: null}
  } as AppState;
  const mockStore = MockStore(state);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('common-profile-info')).toBeInTheDocument();
  expect(screen.getByTestId('friendship-button')).toBeInTheDocument();
  expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();
  await waitFor(() => expect(mockStore.getActions()).toHaveLength(1));
  expect(mockStore.getActions()[0]).toBe(action);
});

it('should render all the needed components (cached user)', async () => {
  // arrange
  const action = {type: 'any'} as any;
  when(MockFriendsActions.getFriendshipInfo(anything()))
    .thenReturn(action);
  when(MockFriendsActions.reset())
    .thenReturn(action);
  const state = {
    friendProfile: {
      user: null,
      friendship: null,
      loading: false,
      modifyingFriendship: false,
      error: null
    },
    search: {results: [{...mockUser, username}]}
  } as AppState;
  const mockStore = MockStore(state);
  // render
  renderIt(mockStore);
  // assert
  expect(await screen.findByTestId('common-profile-info')).toBeInTheDocument();
  expect(screen.getByTestId('friendship-button')).toBeInTheDocument();
  expect(screen.getByText(`@${username}`)).toBeInTheDocument();
  await waitFor(() => expect(mockStore.getActions()).toHaveLength(1));
  expect(mockStore.getActions()[0]).toBe(action);
});

const testError = (error: FriendError) => {
  it('should display an error snackbar if there was an error', async () => {
    // arrange
    const state = {
      friendProfile: {...initialFriendProfileState, error},
      search: {results: [{...mockUser, username}]}
    } as AppState;
    const mockStore = MockStore(state);
    // render
    renderIt(mockStore);
    // assert
    expect(await screen.findByText(stringifyFriendError(error)))
      .toBeInTheDocument();
  });
};

testError(FriendError.general);
testError(FriendError.network);
testError(FriendError.requestAlreadyReceived);
testError(FriendError.requestRemoved);
testError(FriendError.alreadyFriends);

