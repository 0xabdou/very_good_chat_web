import React, {useEffect, useState} from "react";
import MuiAlert, {Color} from "@material-ui/lab/Alert";
import {Snackbar} from "@material-ui/core";

type AlertSnackbarProps = {
  open: boolean,
  autoHideDuration: number,
  onClose: (event?: React.SyntheticEvent, reason?: string) => void,
  severity: Color,
  message: string,
}

export const AlertSnackbar = (props: AlertSnackbarProps) => {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={props.autoHideDuration}
      onClose={props.onClose}
    >
      <MuiAlert elevation={6} variant='filled' onClose={props.onClose}
                severity={props.severity}>
        {props.message}
      </MuiAlert>
    </Snackbar>
  );
};

type ErrorSnackbarProps<ErrorType> = {
  currentError: ErrorType | null,
  stringify: (e: ErrorType | null) => string,
  exclude: ErrorType[],
};

export function ErrorSnackbar<ErrorType>(props: ErrorSnackbarProps<ErrorType>) {
  const [error, setError] = useState<ErrorType | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Show the snackbar if there was an error (must not be an abortedByUser error)
  useEffect(() => {
    if (props.currentError == null)
      setSnackbarVisible(false);
    else if (props.exclude.indexOf(props.currentError) == -1) {
      setError(props.currentError);
      setSnackbarVisible(true);
    }
  }, [props.currentError]);

  const closeSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
    // Don't dismiss the alert if the user clicks out of it
    if (reason == 'clickaway') return;
    setSnackbarVisible(false);
  };

  return (
    <AlertSnackbar
      open={snackbarVisible}
      autoHideDuration={3000}
      onClose={closeSnackbar}
      severity='error'
      message={props.stringify(error)}
    />
  );
}

type SuccessSnackbarProps = {
  renderCount: number,
  message?: string,
}

export const SuccessSnackbar = (props: SuccessSnackbarProps) => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Show the snackbar if there was an error (must not be an abortedByUser error)
  useEffect(() => {
    if (props.renderCount) setSnackbarVisible(true);
  }, [props.renderCount]);

  const closeSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
    // Don't dismiss the alert if the user clicks out of it
    if (reason == 'clickaway') return;
    setSnackbarVisible(false);
  };

  return (
    <AlertSnackbar
      open={snackbarVisible}
      autoHideDuration={3000}
      onClose={closeSnackbar}
      severity='success'
      message={props.message ?? ''}
    />
  );
};
