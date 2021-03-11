import React, {useCallback, useEffect} from "react";
import MainScreen from "./main-screen";
import RegistrationScreen from "./registraion-screen";
import {makeStyles} from "@material-ui/core";
import UserError from "../types/user-error";
import {useUserActions} from "../user-actions-context";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import RetryPage from "../../../components/retry-page";
import FullscreenLoader from "../../../components/fullscreen-loader";
import {Route, Switch} from "react-router-dom";
import ProfileScreen from "./profile-screen";
import EditProfileScreen from "./edit-profile-screen";

const LoggedInScreen = () => {
  const state = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const {getCurrentUser} = useUserActions();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  const classes = useStyles();

  const getErrorMessage = () => {
    const error = state.error;
    switch (error) {
      case UserError.network:
        return 'Check your internet connection, and try again!';
      default:
        return 'Something weird happened!';
    }
  };

  const onRetry = useCallback(() => {
    dispatch((getCurrentUser()));
  }, []);
  let child: React.ReactNode;
  if (!state.initialized) {
    if (state.error != null)
      child = <RetryPage onRetry={onRetry} errorMessage={getErrorMessage()}/>;
    else
      child = <FullscreenLoader/>;
  } else {
    if (state.currentUser == null)
      child = (<RegistrationScreen/>);
    else
      child = (
        <Switch>
          <Route path='/profile'>
            <ProfileScreen/>
          </Route>
          <Route path='/edit-profile'>
            <EditProfileScreen/>
          </Route>
          <Route path='/'>
            <MainScreen/>
          </Route>
        </Switch>
      );
  }
  return (
    <div className={classes.root} data-testid='logged-in-screen'>
      {child}
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
});

export default LoggedInScreen;
