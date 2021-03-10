import React from "react";
import TopBar from "./components/top-bar";
import {makeStyles} from "@material-ui/core";

const MainScreen = () => {

  const classes = useStyles();

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <TopBar/>
    </div>
  );
};

const useStyles = makeStyles({
  wrapper: {
    width: '100%',
    height: '100%',
  }
});

export default MainScreen;