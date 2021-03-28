import React from "react";
import {Icon, IconButton, makeStyles} from "@material-ui/core";

type RetryButtonProps = {
  onClick: () => void,
  message: string,
};

const RetryButton = (props: RetryButtonProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root} data-testid='retry-button'>
      <IconButton onClick={props.onClick}>
        <Icon className={classes.icon}>refresh</Icon>
      </IconButton>
      <p className={classes.message}>{props.message}</p>
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  },
  icon: {
    '&&': {
      color: 'black',
      fontSize: '1.5em',
    },
  },
  message: {
    margin: '0 10px',
    textAlign: 'center',
  }
});

export default RetryButton;