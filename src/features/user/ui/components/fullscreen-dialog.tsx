import React from "react";
import {Dialog, Slide} from "@material-ui/core";
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

  return (
    <Dialog fullScreen open={props.visible} onClose={props.onClose}
            TransitionComponent={Transition}>
      {props.children}
    </Dialog>
  );
};

export default FullScreenDialog;