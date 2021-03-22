import React from "react";
import {AppState, AppStore} from "../../../../../src/store/store";
import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter, Route} from "react-router-dom";
import {FriendsActionsContext} from "../../../../../src/features/friend/friends-actions-context";
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {
  friendsActions,
  FriendsState,
  initialFriendsState
} from "../../../../../src/features/friend/friends-slice";
import FriendRequestsScreen
  from "../../../../../src/features/friend/ui/friend-requests-screen";
import {getMockStore, mockFriendRequests} from "../../../../mock-objects";
import FriendError from "../../../../../src/features/friend/types/friend-error";

const MockStore = getMockStore();
const MockFriendsActions = mock<typeof friendsActions>();
const getRequestsAction = {type: 'get'} as any;
const declineRequestAction = {type: 'decline'} as any;
const acceptRequestAction = {type: 'accept'} as any;
const cancelRequestAction = {type: 'cancel'} as any;
const loadedState: FriendsState = {
  ...initialFriendsState,
  friendRequests: mockFriendRequests
};
const emptyState: FriendsState = {
  ...initialFriendsState,
  friendRequests: {sent: [], received: []}
};
const errorState: FriendsState = {
  ...initialFriendsState,
  error: FriendError.network
};

jest.mock(
  'react-virtualized-auto-sizer',
  () => ({children}: any) => children({height: 600, width: 600})
);

const renderIt = (store: AppStore, path: string = '/requests') => {
  const received = path == '/requests';
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]} initialIndex={0}>
        <Route path={path}>
          <FriendsActionsContext.Provider value={instance(MockFriendsActions)}>
            <FriendRequestsScreen received={received}/>
          </FriendsActionsContext.Provider>
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  reset(MockFriendsActions);
  when(MockFriendsActions.getFriendRequests()).thenReturn(getRequestsAction);
  when(MockFriendsActions.cancelFriendRequest(anything()))
    .thenReturn(cancelRequestAction);
  when(MockFriendsActions.declineFriendRequest(anything()))
    .thenReturn(declineRequestAction);
  when(MockFriendsActions.acceptFriendRequest(anything()))
    .thenReturn(acceptRequestAction);
});

describe('received', () => {
  it('should have "Friend requests" as a header and a "view sent requests" button', () => {
    // arrange
    const mockStore = MockStore({friends: initialFriendsState} as AppState);
    // render
    renderIt(mockStore);
    // assert
    expect(screen.getByText('Friend requests')).toBeInTheDocument();
    expect(screen.getByTestId('view-sent-requests')).toBeInTheDocument();
  });

  it('should display a loader if loading', () => {
    // arrange
    const mockStore = MockStore({friends: initialFriendsState} as AppState);
    // render
    renderIt(mockStore);
    // assert
    expect(screen.getByTestId('requests-loading')).toBeInTheDocument();
    verify(MockFriendsActions.getFriendRequests()).once();
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toBe(getRequestsAction);
  });

  it('should display some text if there are no requests', () => {
    // arrange
    const mockStore = MockStore({friends: emptyState} as AppState);
    // render
    renderIt(mockStore);
    // assert
    expect(screen.getByTestId('no-requests')).toBeInTheDocument();
  });

  it('should display a retry button if there is an error and no request', () => {
    // arrange
    const mockStore = MockStore({friends: errorState} as AppState);
    // render
    renderIt(mockStore);
    // assert
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  describe('when loaded', () => {
    const reqUser = mockFriendRequests.received[0].user;

    it('should display requests', () => {
      // arrange
      const mockStore = MockStore({friends: loadedState} as AppState);
      // render
      renderIt(mockStore);
      // assert
      const items = screen.getAllByTestId('request-list-item');
      expect(items).toHaveLength(mockFriendRequests.received.length);
      expect(screen.getByText(reqUser.username)).toBeInTheDocument();
    });

    it('clicking on a cancel button should decline the request', () => {
      // arrange
      const mockStore = MockStore({friends: loadedState} as AppState);
      // render
      renderIt(mockStore);
      // act
      const cancelButton = screen.getByTestId('cancel-request');
      fireEvent.click(cancelButton);
      // assert
      console.log(mockStore.getActions());
      verify(MockFriendsActions.declineFriendRequest(reqUser.id)).once();
      expect(mockStore.getActions()[0]).toBe(declineRequestAction);
    });

    test('clicking on an accept button should accept the request', () => {
      // arrange
      const mockStore = MockStore({friends: loadedState} as AppState);
      // render
      renderIt(mockStore);
      // act
      const acceptButton = screen.getByTestId('accept-request');
      fireEvent.click(acceptButton);
      // assert
      verify(MockFriendsActions.acceptFriendRequest(reqUser.id)).once();
      expect(mockStore.getActions()[0]).toBe(acceptRequestAction);
    });

    test('the request list item should display a loader if the request is ' +
      'being treated',
      () => {
        // arrange
        const loadingState: FriendsState = {
          ...loadedState,
          beingTreated: [reqUser.id]
        };
        const mockStore = MockStore({friends: loadingState} as AppState);
        // render
        renderIt(mockStore);
        // assert
        expect(screen.getByTestId('request-loading')).toBeInTheDocument();
      }
    );
  });
});

describe('sent', () => {
  const renderSent = (store: AppStore) => renderIt(store, '/sent-requests');

  it('should have "Sent requests" as a header and no "view sent requests" button', () => {
    // arrange
    const mockStore = MockStore({friends: initialFriendsState} as AppState);
    // render
    renderSent(mockStore);
    // assert
    expect(screen.getByText('Sent requests')).toBeInTheDocument();
    expect(screen.queryByTestId('view-sent-requests')).not.toBeInTheDocument();
  });

  it('should display a loader if loading', () => {
    // arrange
    const mockStore = MockStore({friends: initialFriendsState} as AppState);
    // render
    renderSent(mockStore);
    // assert
    expect(screen.getByTestId('requests-loading')).toBeInTheDocument();
    verify(MockFriendsActions.getFriendRequests()).once();
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toBe(getRequestsAction);
  });

  it('should display some text if there are no requests', () => {
    // arrange
    const mockStore = MockStore({friends: emptyState} as AppState);
    // render
    renderSent(mockStore);
    // assert
    expect(screen.getByTestId('no-requests')).toBeInTheDocument();
  });

  it('should display a retry button if there is an error and no request', () => {
    // arrange
    const mockStore = MockStore({friends: errorState} as AppState);
    // render
    renderSent(mockStore);
    // assert
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  describe('when loaded', () => {
    const reqUser = mockFriendRequests.sent[0].user;

    it('should display requests', () => {
      // arrange
      const mockStore = MockStore({friends: loadedState} as AppState);
      // render
      renderSent(mockStore);
      // assert
      const items = screen.getAllByTestId('request-list-item');
      expect(items).toHaveLength(mockFriendRequests.received.length);
      expect(screen.getByText(reqUser.username)).toBeInTheDocument();
    });

    it('clicking on a cancel button should cancel the request', () => {
      // arrange
      const mockStore = MockStore({friends: loadedState} as AppState);
      // render
      renderSent(mockStore);
      // act
      const cancelButton = screen.getByTestId('cancel-request');
      fireEvent.click(cancelButton);
      // assert
      console.log(mockStore.getActions());
      verify(MockFriendsActions.cancelFriendRequest(reqUser.id)).once();
      expect(mockStore.getActions()[0]).toBe(cancelRequestAction);
    });

    test('the request list item should display a loader if the request is ' +
      'being treated',
      () => {
        // arrange
        const loadingState: FriendsState = {
          ...loadedState,
          beingTreated: [reqUser.id]
        };
        const mockStore = MockStore({friends: loadingState} as AppState);
        // render
        renderSent(mockStore);
        // assert
        expect(screen.getByTestId('request-loading')).toBeInTheDocument();
      }
    );
  });
});