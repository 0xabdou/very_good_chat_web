import React, {useCallback, useContext} from "react";
import {Icon, IconButton, makeStyles, Typography} from "@material-ui/core";
import {centeredLayout} from "../../../styles/shared";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {useHistory} from "react-router-dom";
import CommonProfileInfo from "./components/common-profile-info";
import {AuthActionsContext} from "../../auth/auth-actions-context";
import {UserActionsContext} from "../user-actions-context";
import FriendsButton from "./components/friends-button";
import RetryPage from "../../../components/retry-page";
import {stringifyUserError} from "../types/user-error";

const ProfileScreen: React.FC = () => {
  const userState = useAppSelector(state => state.user);
  const history = useHistory();
  const {signOut} = useContext(AuthActionsContext);
  const {getCurrentUser, resetUser} = useContext(UserActionsContext);
  const dispatch = useAppDispatch();

  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const editProfile = useCallback(() => {
    history.push('/edit-profile');
  }, [history]);

  const logout = useCallback(async () => {
    const result = await dispatch(signOut());
    if (result.meta.requestStatus == 'fulfilled')
      dispatch(resetUser());
  }, []);

  const retry = useCallback(async () => {
    dispatch(getCurrentUser());
  }, []);

  if (!userState.initialized) {
    return <FullscreenLoader/>;
  }
  if (!userState.currentUser && userState.error != null) {
    return <RetryPage onRetry={retry}
                      errorMessage={stringifyUserError(userState.error)}/>;
  }
  if (!userState.currentUser) {
    console.log('Displaying profile screen without a user');
    return <div/>;
  }
  const user = userState.currentUser;
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
          onClick={logout}>
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
