import React, {useCallback, useState} from 'react';
import {Button, createStyles, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useAppDispatch} from "../../../store/hooks";
import {useAuthActions} from "../../auth/auth-actions-context";
import {useUserActions} from "../../user/user-actions-context";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {useHistory} from "react-router-dom";
import AlertDialog from "../../../components/alert-dialog";

const SettingsScreen = () => {
  const {signOut} = useAuthActions();
  const {resetUser} = useUserActions();
  const dispatch = useAppDispatch();
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const logoutClicked = useCallback(() => {
    setLogoutMenuOpen(true);
  }, []);

  const logoutConfirmed = useCallback(async () => {
    setLogoutMenuOpen(false);
    const result = await dispatch(signOut());
    if (result.meta.requestStatus == 'fulfilled')
      dispatch(resetUser());
  }, []);

  const logoutCanceled = useCallback(() => {
    setLogoutMenuOpen(false);
  }, []);

  const goToBlockedUsersScreen = useCallback(() => {
    history.push('/blocked-users');
  }, []);

  return (
    <div className={classes.outer} data-testid='settings-screen'>
      <TopBar>
        <Typography variant='h6' className={topBarClasses.title}>
          Settings
        </Typography>
      </TopBar>
      <SettingsItem label='Blocked users' onClick={goToBlockedUsersScreen}/>
      <SettingsItem label='Log out' color='red' onClick={logoutClicked}/>
      <AlertDialog
        title='Log out'
        content='Are you sure you want to logout?'
        open={logoutMenuOpen}
        onCancel={logoutCanceled}
        onConfirm={logoutConfirmed}
      />
    </div>
  );
};

type SettingsItemProps = {
  label: string,
  onClick: () => void,
  color?: string,
}

const SettingsItem = (props: SettingsItemProps) => {
  const classes = useButtonStyles({color: props.color});
  return (
    <Button className={classes.button} onClick={props.onClick}>
      {props.label}
    </Button>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '56px',
  }
});

type ButtonStyles = {
  color?: string,
}

const useButtonStyles = makeStyles<Theme, ButtonStyles>(theme => createStyles({
  button: {
    marginLeft: theme.spacing(1),
    height: '55px',
    '& .MuiButton-label': {
      color: props => props.color,
      justifyContent: 'start'
    }
  }
}));

export default SettingsScreen;