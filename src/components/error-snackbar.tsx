import React, {useEffect, useState} from "react";
import AlertSnackbar from "./alert-snackbar";

type ErrorSnackbarProps<ErrorType> = {
  currentError: ErrorType | null,
  stringify: (e: ErrorType | null) => string,
  exclude: ErrorType[],
};

function ErrorSnackbar<ErrorType>(props: ErrorSnackbarProps<ErrorType>) {
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
};

export default ErrorSnackbar;