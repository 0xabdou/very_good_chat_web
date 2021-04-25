import React, {useCallback} from "react";
import {useHistory} from "react-router-dom";
import {Icon, IconButton, makeStyles} from "@material-ui/core";
import {useMobileMQ} from "../styles/media-query";

type BackButtonProps = {
  to?: string,
  hide?: boolean,
  mobileOnly?: boolean,
  className?: string,
};

const BackButton = (props: BackButtonProps) => {
  const history = useHistory();
  const state = history.location.state as any;
  const isMobile = useMobileMQ();
  const classes = useStyles();

  const onClick = useCallback(() => {
    console.log("CAN GO BACK: ", state && state.canGoBack);
    if (props.to) return history.replace(props.to, {canGoBack: true});
    if (state && state.canGoBack)
      history.goBack();
    else
      history.replace('/');
  }, [history, props.to]);

  if (props.hide || (props.mobileOnly && !isMobile))
    return <div/>;
  return (
    <IconButton className={props.className} onClick={onClick}>
      <Icon className={classes.icon}>arrow_back</Icon>
    </IconButton>
  );
};

const useStyles = makeStyles({
  icon: {
    color: "black"
  }
});

export default BackButton;