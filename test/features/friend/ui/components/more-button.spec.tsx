import {instance, mock, reset, verify, when} from "ts-mockito";
import {
  friendProfileActions,
  FriendProfileState
} from "../../../../../src/features/friend/friend-profile-slice";
import {getMockStore, mockUser} from "../../../../mock-objects";
import {FriendshipStatus} from "../../../../../src/features/friend/types/friendship";
import {AppState, AppStore} from "../../../../../src/store/store";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved
} from "@testing-library/react";
import {Provider} from "react-redux";
import {FriendProfileActionsContext} from "../../../../../src/features/friend/friend-profile-actions-context";
import React from "react";
import MoreButton
  from "../../../../../src/features/friend/ui/components/more-button";

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
        <MoreButton/>
      </FriendProfileActionsContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  reset(MockActions);
});

describe('when the current user is blocked by the other user', () => {
  it('should display nothing (an empty div)', () => {
    // arrange
    const state: FriendProfileState = {
      ...initialState,
      friendship: {status: FriendshipStatus.BLOCKED}
    };
    const mockStore = MockStore({friendProfile: state} as AppState);
    // render
    renderIt(mockStore);
    // assert
    expect(screen.getByTestId('no-more')).toBeInTheDocument();
  });
});

describe('when the current user is blocking the other user', () => {
  it('the unblocking flow should work', async () => {
    // arrange
    const state: FriendProfileState = {
      ...initialState,
      friendship: {status: FriendshipStatus.BLOCKING}
    };
    const mockStore = MockStore({friendProfile: state} as AppState);
    when(MockActions.unblock()).thenReturn(action);
    // render
    renderIt(mockStore);
    // click the more button
    const moreButton = screen.getByTestId('more-button');
    fireEvent.click(moreButton);
    // click the unblock button
    const unblockButton = await screen.findByTestId('unblock-button');
    fireEvent.click(unblockButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('unblock-button'));
    // click the confirm button
    const confirmButton = await screen.findByTestId('alert-confirm');
    fireEvent.click(confirmButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('alert-confirm'));
    // assert unblocking
    verify(MockActions.unblock()).once();
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toBe(action);
  });
});

const testNonBlockFriendship = (status: FriendshipStatus) => {
  describe(`when the friendship status is ${status}`, () => {
    test('The blocking flow should work', async () => {
      // arrange
      const state: FriendProfileState = {...initialState, friendship: {status}};
      const mockStore = MockStore({friendProfile: state} as AppState);
      when(MockActions.block()).thenReturn(action);
      // render
      renderIt(mockStore);
      // click the more button
      const moreButton = screen.getByTestId('more-button');
      fireEvent.click(moreButton);
      // click the block button
      const blockButton = await screen.findByTestId('block-button');
      fireEvent.click(blockButton);
      await waitForElementToBeRemoved(() => screen.queryByTestId('block-button'));
      // click the confirm button
      const confirmButton = await screen.findByTestId('alert-confirm');
      fireEvent.click(confirmButton);
      await waitForElementToBeRemoved(() => screen.queryByTestId('alert-confirm'));
      // assert unblocking
      verify(MockActions.block()).once();
      expect(mockStore.getActions()).toHaveLength(1);
      expect(mockStore.getActions()[0]).toBe(action);
    });
  });
};

testNonBlockFriendship(FriendshipStatus.FRIENDS);
testNonBlockFriendship(FriendshipStatus.STRANGERS);
testNonBlockFriendship(FriendshipStatus.REQUEST_RECEIVED);
testNonBlockFriendship(FriendshipStatus.REQUEST_SENT);

