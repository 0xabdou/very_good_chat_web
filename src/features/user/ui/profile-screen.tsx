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

const ProfileScreen: React.FC = () => {
  const userState = useAppSelector(state => state.user);
  const history = useHistory();
  const {signOut} = useContext(AuthActionsContext);
  const {resetUser} = useContext(UserActionsContext);
  const dispatch = useAppDispatch();

  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const editProfile = useCallback(() => {
    history.push('/edit-profile');
  }, []);

  const logout = useCallback(async () => {
    const result = await dispatch(signOut());
    if (result.meta.requestStatus == 'fulfilled')
      dispatch(resetUser());
  }, []);

  if (!userState.initialized) {
    return <FullscreenLoader/>;
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
    margin: 'auto'
  },
  layout: centeredLayout,
});

export default ProfileScreen;
