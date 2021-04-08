import React, {useCallback, useContext} from "react";
import {Icon, IconButton, makeStyles, Typography} from "@material-ui/core";
import {centeredLayout} from "../../../shared/styles/shared";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {useHistory} from "react-router-dom";
import CommonProfileInfo from "./components/common-profile-info";
import {MeActionsContext} from "../me-actions-context";
import FriendsButton from "./components/friends-button";
import RetryPage from "../../../shared/components/retry-page";
import {stringifyUserError} from "../types/user-error";

const ProfileScreen: React.FC = () => {
  const meState = useAppSelector(state => state.me);
  const history = useHistory();
  const {getMe} = useContext(MeActionsContext);
  const dispatch = useAppDispatch();

  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const editProfile = useCallback(() => {
    history.push('/edit-profile');
  }, [history]);

  const goToSettings = useCallback(async () => {
    history.push('/settings');
  }, [history]);

  const retry = useCallback(async () => {
    dispatch(getMe());
  }, []);

  if (!meState.initialized) {
    return <FullscreenLoader/>;
  }
  if (!meState.me && meState.error != null) {
    return (
      <RetryPage
        onRetry={retry}
        errorMessage={stringifyUserError(meState.error)}/>
    );
  }
  if (!meState.me) {
    console.log('Displaying profile screen without a user');
    return <div/>;
  }
  const user = meState.me;
  return (
    <div className={classes.outer} data-testid='profile-screen'>
      <TopBar>
        <Typography variant="h6" className={topBarClasses.title}>
          Profile
        </Typography>
        <IconButton
          className={topBarClasses.actionButton}
          onClick={editProfile}
          data-testid='edit-profile-button'>
          <Icon>edit</Icon>
        </IconButton>
        <IconButton
          className={topBarClasses.actionButton}
          data-testid='settings-button'
          onClick={goToSettings}>
          <Icon>settings</Icon>
        </IconButton>
      </TopBar>
      <div className={classes.wrapper}>
        <CommonProfileInfo user={user}/>
        <FriendsButton/>
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  wrapper: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  layout: centeredLayout,
});

export default ProfileScreen;
