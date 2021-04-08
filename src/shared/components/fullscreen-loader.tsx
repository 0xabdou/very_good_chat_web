import {PulseLoader} from "react-spinners";
import React from "react";
import {makeStyles} from "@material-ui/styles";

const FullscreenLoader = () => {
  const classes = useStyles();

  return <div className={classes.root} data-testid='fullscreen-loader'>
    <span className={classes.loader}>
    <PulseLoader/>
    </span>
  </div>;
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  loader: {
    margin: 'auto',
  }
});

export default FullscreenLoader;