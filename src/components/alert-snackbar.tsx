import MuiAlert, {Color} from "@material-ui/lab/Alert";
import React from "react";
import {Snackbar} from "@material-ui/core";

type AlertSnackbarProps = {
  open: boolean,
  autoHideDuration: number,
  onClose: (event?: React.SyntheticEvent, reason?: string) => void,
  severity: Color,
  message: string,
}

const AlertSnackbar = (props: AlertSnackbarProps) => {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={props.autoHideDuration}
      onClose={props.onClose}
    >
      <MuiAlert elevation={6} variant='filled' onClose={props.onClose} severity={props.severity}>
        {props.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default AlertSnackbar;