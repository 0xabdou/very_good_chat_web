import React from "react";
import {Dialog, makeStyles, Slide} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} timeout={400}/>;
});

type FullScreenDialogProps = {
  children: React.ReactNode,
  visible: boolean,
  onClose?: () => void,
};

const FullScreenDialog = (props: FullScreenDialogProps) => {
  const classes = useStyles();
  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={props.visible} onClose={props.onClose}
      TransitionComponent={Transition}
    >
      {props.children}
    </Dialog>
  );
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
  }
});

export default FullScreenDialog;