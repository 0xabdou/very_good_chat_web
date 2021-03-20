import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import React from "react";

type AlertDialogProps = {
  title: string,
  content: string,
  open: boolean,
  onCancel: () => void,
  onConfirm: () => void,
}

const AlertDialog = (props: AlertDialogProps) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid='alert-dialog'
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{props.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} color="primary" data-testid='alert-cancel'>
          Cancel
        </Button>
        <Button onClick={props.onConfirm} color="primary" autoFocus data-testid='alert-confirm'>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;