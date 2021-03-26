import React from "react";
import {AppState, AppStore} from "../../../../src/store/store";
import {Provider} from "react-redux";
import {fireEvent, render, screen} from "@testing-library/react";
import {
  getMockAuthActions,
  getMockStore,
  initialAuthState,
  mockAuthActionObjects
} from "../../../mock-objects";
import {AuthActionsContext} from "../../../../src/features/auth/auth-actions-context";
import AuthError from "../../../../src/features/auth/types/auth-error";
import LoginScreen from "../../../../src/features/auth/ui/login-screen";

const MockStore = getMockStore();
const mockAuthAction = getMockAuthActions();

const authState = initialAuthState;
const initialState = {
  auth: authState,
} as AppState;

const loginWithGoogleText = 'Login with Google';

const Wrapped = ({mockStore}: { mockStore: AppStore }) => {
  return (
    <Provider store={mockStore}>
      <AuthActionsContext.Provider value={mockAuthAction}>
        <LoginScreen/>
      </AuthActionsContext.Provider>
    </Provider>
  );
};

const renderComponent = (mockStore: AppStore) => {
  render(<Wrapped mockStore={mockStore}/>);
};

test('should contain a login button', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByText(loginWithGoogleText)).toBeInTheDocument();
});

test(
  'Clicking the login button should dispatch the appropriate action',
  async () => {
    // arrange
    const mockStore = MockStore(initialState);
    // act
    renderComponent(mockStore);
    fireEvent.click(screen.getByText(loginWithGoogleText));
    // assert
    expect(mockStore.getActions()).toContain(mockAuthActionObjects.signInWithGoogle);
  },
);

test(
  'If the state is loading, should display a spinner instead of the button',
  () => {
    // arrange
    const loadingState: AppState = {
      ...initialState,
      auth: {
        ...authState,
        loading: true,
      },
    };
    const mockStore = MockStore(loadingState);
    // act
    renderComponent(mockStore);
    expect(screen.queryByText(loginWithGoogleText)).toBeNull();
    expect(screen.getByTestId('login-spinner')).toBeInTheDocument();
  },
);

test('if the state has error, should display an error snackbar', () => {
  // arrange
  const errorState: AppState = {
    ...initialState,
    auth: {
      ...authState,
      authError: AuthError.network,
    },
  };
  const mockStore = MockStore(errorState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByRole('alert')).toBeInTheDocument();
});