import React, {useCallback, useState} from 'react';
import {
  Button,
  createStyles,
  makeStyles,
  Switch,
  Typography
} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {useAuthActions} from "../../auth/auth-actions-context";
import {useMeActions} from "../../user/me-actions-context";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {useHistory} from "react-router-dom";
import AlertDialog from "../../../components/alert-dialog";

const SettingsScreen = () => {
  const meState = useAppSelector(state => state.me);
  const {signOut} = useAuthActions();
  const {toggleActiveStatus, reset} = useMeActions();
  const dispatch = useAppDispatch();
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  const toggleAS = useCallback(() => {
    dispatch(toggleActiveStatus());
  }, []);

  const goToBlockedUsersScreen = useCallback(() => {
    history.push('/blocked-users');
  }, []);

  const logoutClicked = useCallback(() => {
    setLogoutMenuOpen(true);
  }, []);

  const logoutConfirmed = useCallback(async () => {
    setLogoutMenuOpen(false);
    const result = await dispatch(signOut());
    if (result.meta.requestStatus == 'fulfilled')
      dispatch(reset());
  }, []);

  const logoutCanceled = useCallback(() => {
    setLogoutMenuOpen(false);
  }, []);


  return (
    <div className={classes.outer} data-testid='settings-screen'>
      <TopBar>
        <Typography variant='h6' className={topBarClasses.title}>
          Settings
        </Typography>
      </TopBar>
      <SettingsItem
        onClick={toggleAS}
        disabled={meState.updatingUser}
      >
        Active status
        <Switch
          className={classes.switch}
          disabled={meState.updatingUser}
          checked={meState.me!.activeStatus}/>
      </SettingsItem>
      <SettingsItem onClick={goToBlockedUsersScreen}>
        Blocked users
      </SettingsItem>
      <SettingsItem color='red' onClick={logoutClicked}>
        Log out
      </SettingsItem>
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
  children: React.ReactNode,
  onClick: () => void,
  disabled?: boolean,
  color?: string,
}

const SettingsItem = (props: SettingsItemProps) => {
  const classes = useButtonStyles({color: props.color});
  return (
    <Button
      className={classes.button}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.children}
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
  },
  switch: {
    '& .Mui-checked': {
      color: 'green',
    },
    '&& .MuiSwitch-track': {
      backgroundColor: 'green',
    }
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