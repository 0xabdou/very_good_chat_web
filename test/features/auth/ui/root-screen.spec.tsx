import React from 'react';
import {AppState, AppStore} from "../../../../src/store/store";
import {
  getMockAuthActions,
  getMockStore,
  initialAuthState,
  initialUserState,
  mockAuthActionObjects
} from "../../../mock-objects";
import {render, screen} from "@testing-library/react";
import RootScreen from "../../../../src/features/auth/ui/root-screen";
import {Provider} from "react-redux";
import {AuthActionsContext} from "../../../../src/features/auth/auth-actions-context";
import {Mock} from "jest-mock";

const MockStore = getMockStore();
const mockAuthActions = getMockAuthActions();

const authState = initialAuthState;
const initialState = {
  auth: authState,
  user: initialUserState,
} as AppState;

beforeEach(() => {
  (mockAuthActions.getAccessToken as unknown as Mock<any, any>).mockClear();
});

const Wrapped = ({mockStore}: { mockStore: AppStore }) => {
  return (
    <Provider store={mockStore}>
      <AuthActionsContext.Provider value={mockAuthActions}>
        <RootScreen/>
      </AuthActionsContext.Provider>
    </Provider>
  );
};

const renderComponent = (mockStore: AppStore) => {
  render(<Wrapped mockStore={mockStore}/>);
};

test('should dispatch getAccessToken', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(mockAuthActions.getAccessToken).toBeCalledTimes(1);
  expect(mockStore.getActions()).toContain(mockAuthActionObjects.getAccessToken);
});

test(
  'should render a loading component if the state is not yet initialized',
  () => {
    // arrange
    const mockStore = MockStore(initialState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
  },
);

test(
  'should render the login screen if the state is initialized but no user is logged in',
  async () => {
    // arrange
    const loginState: AppState = {
      ...initialState,
      auth: {...authState, initialized: true},
    };
    const mockStore = MockStore(loginState);
    // act
    renderComponent(mockStore);
    // assert
    expect(await screen.findByTestId('login-screen')).toBeInTheDocument();
    screen.debug();
  },
);

test(
  'should render the logged in screen if the state is initialized and a user is logged in',
  async () => {
    // arrange
    const loggedInState: AppState = {
      ...initialState,
      auth: {...authState, initialized: true, accessToken: 'yo'},
    };
    const mockStore = MockStore(loggedInState);
    // act
    renderComponent(mockStore);
    // assert
    expect(await screen.findByTestId('logged-in-screen')).toBeInTheDocument();
    screen.debug();
  },
);