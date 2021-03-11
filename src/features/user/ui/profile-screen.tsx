import React, {useCallback} from "react";
import {
  Avatar,
  Icon,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import {centeredLayout, wrapper} from "../../../styles/shared";
import {useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {useHistory} from "react-router-dom";

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
      <div className={classes.wrapper}>
        <div className={classes.layout}>
          <Avatar className={classes.photo} src={user.photoURL ?? undefined}/>
          <Typography className={classes.username}>
            @{user.username}
          </Typography>
          {user.name && <Typography className={classes.name}>
            {user.name}
          </Typography>}
        </div>
      </div>
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
  photo: {
    width: '150px',
    height: '150px',
    border: '1px solid black'
  },
  username: {
    fontSize: '1rem',
  },
  name: {
    fontSize: '1.3rem',
  },
});

export default ProfileScreen;
