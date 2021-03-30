import React from 'react';
import {AppState, AppStore} from "../../../../src/store/store";
import {
  getMockStore,
  initialAuthState,
  initialMeState,
} from "../../../mock-objects";
import {render, screen} from "@testing-library/react";
import RootScreen from "../../../../src/features/auth/ui/root-screen";
import {Provider} from "react-redux";
import {AuthActionsContext} from "../../../../src/features/auth/auth-actions-context";
import {instance, mock, resetCalls, verify, when} from "ts-mockito";
import {authActions} from "../../../../src/features/auth/auth-slice";

const MockStore = getMockStore();
const MockAuthActions = mock<typeof authActions>();
const accessTokenAction = {type: 'at'} as any;

const authState = initialAuthState;
const initialState = {
  auth: authState,
  me: initialMeState,
} as AppState;

beforeAll(() => {
  when(MockAuthActions.getAccessToken()).thenReturn(accessTokenAction);
});

beforeEach(() => {
  resetCalls(MockAuthActions);
});

const Wrapped = ({mockStore}: { mockStore: AppStore }) => {
  return (
    <Provider store={mockStore}>
      <AuthActionsContext.Provider value={instance(MockAuthActions)}>
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
  verify(MockAuthActions.getAccessToken()).once();
  expect(mockStore.getActions()).toHaveLength(1);
  expect(mockStore.getActions()[0]).toBe(accessTokenAction);
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
  },
);