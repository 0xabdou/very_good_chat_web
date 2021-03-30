import {shallowEqual} from "react-redux";
import React, {useCallback, useEffect} from "react";
import LoggedInScreen from "../../user/ui/logged-in-screen";
import LoginScreen from "./login-screen";
import {useAuthActions} from "../auth-actions-context";
import MeActionsProvider from "../../user/me-actions-context";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import AuthError from "../types/auth-error";
import RetryPage from "../../../components/retry-page";

const RootScreen = () => {
  const state = useAppSelector(state => state.auth, shallowEqual);
  const dispatch = useAppDispatch();
  const {getAccessToken} = useAuthActions();

  useEffect(() => {
    dispatch(getAccessToken());
  }, []);

  const onRetry = useCallback(() => {
    dispatch(getAccessToken());
  }, []);

  const getErrorMessage = () => {
    const error = state.authError;
    switch (error) {
      case AuthError.network:
        return 'Check your internet connection, and try again!';
      default:
        return 'Something weird happened!';
    }
  };

  if (!state.initialized) {
    if (state.authError != null)
      return <RetryPage onRetry={onRetry} errorMessage={getErrorMessage()}/>;
    return <FullscreenLoader/>;
  }
  const loggedIn = state.accessToken != null;
  if (loggedIn) {
    return (
      <MeActionsProvider>
        <LoggedInScreen/>
      </MeActionsProvider>
    );
  } else return <LoginScreen/>;
};

export default RootScreen;