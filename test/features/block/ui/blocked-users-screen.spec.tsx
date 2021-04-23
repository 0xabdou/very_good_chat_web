import React from 'react';
import {AppState, AppStore} from "../../../../src/core/redux/store";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import {BlockActionsContext} from "../../../../src/features/block/block-actions-context";
import {instance, mock, resetCalls, verify, when} from "ts-mockito";
import {
  blockActions,
  BlockState,
  initialBlockState
} from "../../../../src/features/block/block-slice";
import BlockedUsersScreen
  from "../../../../src/features/block/ui/blocked-users-screen";
import {getMockStore, mockBlock} from "../../../mock-objects";
import BlockError from "../../../../src/features/block/types/block-error";
import {Block} from "../../../../src/features/block/types/block";

const MockBlockActions = mock<typeof blockActions>();
const MockStore = getMockStore();
const action = {type: 'fetch'} as any;

const renderIt = (store: AppStore) => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/blocked-users']} initialIndex={0}>
        <BlockActionsContext.Provider value={instance(MockBlockActions)}>
          <BlockedUsersScreen/>
        </BlockActionsContext.Provider>
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  when(MockBlockActions.getBlockedUsers()).thenReturn(action);
  resetCalls(MockBlockActions);
});

it('should fetch blocked users on render, and have "Blocked users" as title', async () => {
  // arrange
  const state = {...initialBlockState};
  const mockStore = MockStore({block: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByText('Blocked users')).toBeInTheDocument();
  await waitFor(() => verify(MockBlockActions.getBlockedUsers()).once());
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(action);
});

it('should display a fullscreen loader if loading', () => {
  // arrange
  const state = {...initialBlockState};
  const mockStore = MockStore({block: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
});

it('should display a list of blocked users if there are any', () => {
  // arrange
  const blocks: Block[] = [
    mockBlock,
    {
      ...mockBlock,
      user: {...mockBlock.user, username: 'usernammmm', id: 'iddddddd'}
    },
  ];
  const state: BlockState = {...initialBlockState, blocks};
  const mockStore = MockStore({block: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  const items = screen.getAllByTestId('blocked-list-item');
  expect(items).toHaveLength(blocks.length);
});

it('should display a message if there are no blocked users', () => {
  // arrange
  const state: BlockState = {...initialBlockState, blocks: []};
  const mockStore = MockStore({block: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  expect(screen.getByTestId('no-blocked-users')).toBeInTheDocument();
});

it('should display a retry button if there was an error', async () => {
  // arrange
  const state: BlockState = {...initialBlockState, error: BlockError.network};
  const mockStore = MockStore({block: state} as AppState);
  // render
  renderIt(mockStore);
  // assert
  const retryButton = screen.getByTestId('retry-button');
  fireEvent.click(retryButton);
  await waitFor(() => expect(mockStore.getActions()).toHaveLength(2));
  expect(mockStore.getActions()[1]).toBe(action);
  verify(MockBlockActions.getBlockedUsers()).twice();
});