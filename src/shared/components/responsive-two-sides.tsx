import {makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {wrapper} from "../styles/shared";
import React from "react";
import {useLargeMQ, useMobileMQ} from "../styles/media-query";

export type ResponsiveTwoSidesProps = {
  leftTopBar: React.ReactNode,
  leftChildren: React.ReactNode,
  rightChildren: React.ReactNode,
  rightFiller?: React.ReactNode
}

const ResponsiveTwoSides = (props: ResponsiveTwoSidesProps) => {
  const isMobile = useMobileMQ();
  const isLarge = useLargeMQ();
  const classes = useStyles({isMobile, isLarge});

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <div className={classes.horizontalWrapper}>
        <div className={classes.leftSection}>
          <div className={classes.leftSectionTopBar}>
            {props.leftTopBar}
          </div>
          {props.leftChildren}
        </div>
        <div className={classes.rightSection}>
          {props.rightChildren}
          <div className={classes.filler}>
            {props.rightFiller}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTwoSides;

type MainScreenStyle = {
  isMobile: boolean,
  isLarge: boolean,
}

const useStyles = makeStyles<Theme, MainScreenStyle>({
  wrapper: {
    ...wrapper,
    flexDirection: 'column',
    height: "100%",
    overflowY: "hidden",
    overflowX: "hidden",
  },
  horizontalWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  leftSection: props => ({
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: props.isMobile
      ? "100%"
      : props.isLarge ? "35%" : "40%",
    minWidth: "300px",
    borderRight: "0.1px solid rgba(0,0,0,0.1)",
    paddingTop: "70px",
  }),
  leftSectionTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    display: "flex",
    padding: "8px 16px",
    alignItems: "center",
    width: "100%",
  },
  rightSection: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
    width: "1px",
  },
  filler: props => ({
    display: props.isMobile ? "none" : undefined,
    position: "absolute",
    color: "black",
    zIndex: -1,
  })
});
