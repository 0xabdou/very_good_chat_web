import React, {useCallback} from "react";
import {Icon, IconButton, makeStyles, Typography} from "@material-ui/core";
import {centeredLayout, wrapper} from "../../../styles/shared";
import {useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {useHistory} from "react-router-dom";
import CommonProfileInfo from "./components/common-profile-info";

const ProfileScreen = () => {
  const userState = useAppSelector(state => state.user);
  const history = useHistory();

  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const editProfile = useCallback(() => {
    history.push('/edit-profile');
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
          data-testid='settings-button'>
          <Icon>settings</Icon>
        </IconButton>
      </TopBar>
      <CommonProfileInfo user={user}/>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    height: '100%',
    width: '100%',
  },
  wrapper: wrapper,
  layout: centeredLayout,
});

export default ProfileScreen;
