import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved
} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../../src/store/store";
import {instance, mock, reset, when} from "ts-mockito";
import {
  friendProfileActions,
  FriendProfileState
} from "../../../../../src/features/friend/friend-profile-slice";
import {FriendProfileActionsContext} from "../../../../../src/features/friend/friend-profile-actions-context";
import FriendshipButton
  from "../../../../../src/features/friend/ui/components/friendship-button";
import {getMockStore, mockUser} from "../../../../mock-objects";
import {FriendshipStatus} from "../../../../../src/features/friend/types/friendship";

const MockActions = mock<typeof friendProfileActions>();
const MockStore = getMockStore();
const initialState: FriendProfileState = {
  user: mockUser,
  friendship: {status: FriendshipStatus.STRANGERS},
  loading: false,
  modifyingFriendship: false,
  error: null
};
const action = {
  type: 'very nice action',
  meta: {requestStatus: 'fulfilled'}
} as any;

const renderIt = (mockStore: AppStore) => {
  render(
    <Provider store={mockStore}>
      <FriendProfileActionsContext.Provider value={instance(MockActions)}>
        <FriendshipButton/>
      </FriendProfileActionsContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  reset(MockActions);
});

test('when the users are strangers', async () => {
  // arrange
  const state: FriendProfileState = {
    ...initialState,
    friendship: {status: FriendshipStatus.STRANGERS}
  };
  const mockStore = MockStore({friendProfile: state} as AppState);
  when(MockActions.sendFriendRequest()).thenReturn(action);
  // render
  renderIt(mockStore);
  // assert
  // It should display a "Add user" icon button
  const button = screen.getByTestId('fas fa-user-plus');
  expect(button).toBeInTheDocument();
  // clicking the button should send a friend request
  fireEvent.click(button);
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(action);
});

test('when the users are friends', async () => {
  // arrange
  const state: FriendProfileState = {
    ...initialState,
    friendship: {status: FriendshipStatus.FRIENDS, date: new Date()},
  };
  const mockStore = MockStore({friendProfile: state} as AppState);
  when(MockActions.unfriend()).thenReturn(action);
  // render
  renderIt(mockStore);
  // assert
  // It should display a "Add user" icon button
  const button = screen.getByTestId('fas fa-user-check');
  expect(button).toBeInTheDocument();
  // clicking the button should display a menu
  fireEvent.click(button);
  let unfriendButton = await screen.findByTestId('unfriend');
  expect(unfriendButton).toBeInTheDocument();
  // clicking the unfriend menu item should display an alert dialog
  fireEvent.click(unfriendButton);
  const cancelButton = await screen.findByTestId('alert-cancel');
  expect(cancelButton).toBeInTheDocument();
  // canceling the unfriending should dispatch no actions to the store
  fireEvent.click(cancelButton);
  await waitForElementToBeRemoved(() => screen.queryByTestId('alert-cancel'));
  expect(mockStore.getActions()).toHaveLength(0);
  // click the button again
  fireEvent.click(button);
  // click unfriend again
  unfriendButton = await screen.findByTestId('unfriend');
  fireEvent.click(unfriendButton);
  // click confirm this time
  const confirmButton = await screen.findByTestId('alert-confirm');
  fireEvent.click(confirmButton);
  // an unfriend action should be dispatched to the store
  await waitForElementToBeRemoved(() => screen.queryByTestId('alert-confirm'));
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(action);
});

test('When a request was sent', async () => {
  // arrange
  const state: FriendProfileState = {
    ...initialState,
    friendship: {status: FriendshipStatus.REQUEST_SENT, date: new Date()},
  };
  const mockStore = MockStore({friendProfile: state} as AppState);
  when(MockActions.cancelFriendRequest()).thenReturn(action);
  // render
  renderIt(mockStore);
  // the friendship button should display a "pending" icon
  const button = screen.getByTestId('fas fa-user-clock');
  expect(button).toBeInTheDocument();
  // clicking that button should display a menu with a cancel button
  fireEvent.click(button);
  const cancelButton = await screen.findByTestId('cancel request');
  expect(cancelButton).toBeInTheDocument();
  // clicking the cancel button should cancel the sent request
  fireEvent.click(cancelButton);
  await waitForElementToBeRemoved(() => screen.queryByTestId('cancel request'));
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(action);
});

describe('when a request was received', () => {
  const state: FriendProfileState = {
    ...initialState,
    friendship: {status: FriendshipStatus.REQUEST_RECEIVED, date: new Date()},
  };

  test('accepting', async () => {
    // arrange
    const mockStore = MockStore({friendProfile: state} as AppState);
    when(MockActions.acceptFriendRequest()).thenReturn(action);
    // render
    renderIt(mockStore);
    // the friendship button should display a "pending" icon
    const button = screen.getByTestId('fas fa-user-clock');
    expect(button).toBeInTheDocument();
    // clicking that button should display a menu with an accept button
    fireEvent.click(button);
    const acceptButton = await screen.findByTestId('accept request');
    expect(acceptButton).toBeInTheDocument();
    // clicking the accept button should accept the received request
    fireEvent.click(acceptButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('accept request'));
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toBe(action);
  });

  test('declining', async () => {
    // arrange
    const mockStore = MockStore({friendProfile: state} as AppState);
    when(MockActions.declineFriendRequest()).thenReturn(action);
    // render
    renderIt(mockStore);
    // the friendship button should display a "pending" icon
    const button = screen.getByTestId('fas fa-user-clock');
    expect(button).toBeInTheDocument();
    // clicking that button should display a menu with a decline button
    fireEvent.click(button);
    const declineButton = await screen.findByTestId('decline request');
    expect(declineButton).toBeInTheDocument();
    // clicking the decline button should decline the received request
    fireEvent.click(declineButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('decline request'));
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toBe(action);
  });
});