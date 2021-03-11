import React from "react";
import {AppBar, createStyles, makeStyles, Toolbar} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {wrapper} from "../../../../styles/shared";

type TopBarProps = {
  children: React.ReactNode[],
}

const TopBar = ({children}: TopBarProps) => {

  const classes = useStyles();

  return (
    <AppBar className={classes.appBar} position="absolute" elevation={0}>
      <Toolbar className={classes.toolBar}>
        {children}
      </Toolbar>
    </AppBar>
  );
};

const useStyles = makeStyles({
    appBar: {
      backgroundColor: 'white',
    },
    toolBar: {
      backgroundColor: 'white',
    },
  }
);

export const useTopBarStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: wrapper,
    leading: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      color: 'black',
    },
    actionButton: {
      color: 'black',
    }
  }),
);
export default TopBar;
