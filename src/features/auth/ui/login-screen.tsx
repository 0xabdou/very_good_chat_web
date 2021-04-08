import {shallowEqual} from "react-redux";
import React from "react";
import AuthError from "../types/auth-error";
import {Button, createStyles, Icon, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {PulseLoader} from "react-spinners";
import {
  centeredLayout,
  nonDraggable,
  nonSelectable,
  wrapper
} from "../../../shared/styles/shared";
import {ErrorSnackbar} from "../../../shared/components/snackbars";
import {useAuthActions} from "../auth-actions-context";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import logoUrl from '../../../images/vgc_transparent_black.png';


const LoginScreen = () => {
  // redux hooks
  const state = useAppSelector(state => state.auth, shallowEqual);
  const dispatch = useAppDispatch();
  const {signInWithGoogle} = useAuthActions();


  const stringifyError = (e: AuthError | null) => {
    switch (e) {
      case AuthError.cookiesDisabled:
        return 'Please enable your cookies';
      case AuthError.network:
        return 'Check your internet';
      default:
        return 'Something weird happened';
    }
  };

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(signInWithGoogle());
  };

  const classes = useStyles();
  return (
    <div className={classes.wrapper} data-testid='login-screen'>
      <div className={classes.layout}>
        <img className={classes.logo} src={logoUrl}
             alt='logo'/>
        <div className={classes.buttonWrapper}>
          {!state.loading && <Button
            className={classes.loginButton}
            color='primary'
            onClick={login}
            disabled={state.loading}
            startIcon={<Icon
              className={'fa fa-google ' + classes.loginButtonIcon}/>}
            variant='contained'>
            Login with Google
          </Button>}
          {state.loading &&
          <span data-testid='login-spinner'><PulseLoader/></span>}
        </div>
        <ErrorSnackbar
          currentError={state.authError}
          stringify={stringifyError}
          exclude={[AuthError.abortedByUser]}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    ...wrapper,
    ...nonSelectable,
  },
  layout: centeredLayout,
  logo: {
    height: '250px',
    width: 'auto',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
    ...nonDraggable,
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '45px',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  loginButton: {
    fontSize: '1.2em',
  },
  loginButtonIcon: {
    '&&': {
      fontSize: '1.2em',
    }
  }
}));

export default LoginScreen;
