import React from "react";
import {Button, unstable_createMuiStrictModeTheme as createMuiTheme, getLuminance, Icon, makeStyles, Theme} from "@material-ui/core";


export type CircleButtonStyle = {
  size?: number,
  bgColor?: string,
  iconColor?: string,
  margin?: string,
};


export type CircleButtonProps = {
  icon: string,
  onClick: () => void,
  'data-testid'?: string,
} & CircleButtonStyle;

const CircleButton = (props: CircleButtonProps) => {
  const classes = useStyles(props);
  return (
    <Button
      className={classes.button}
      onClick={props.onClick}
      variant='contained'
      data-testid={props["data-testid"]}
    >
      <Icon>{props.icon}</Icon>
    </Button>
  );
};

const useStyles = makeStyles<Theme, CircleButtonStyle>({
  button: props => {
    const defaultBgColor = '#ffffff';
    const defaultIconColor = '#000000';
    const {palette: {primary: bgColor}} = createMuiTheme({
      palette: {
        primary: {
          main: props.bgColor || defaultBgColor,
        },
      },
    });
    const size = props.size || defaultSize;
    const iconColor = props.iconColor || defaultIconColor;
    const l = getLuminance(bgColor.main);
    const color = l > 0.5 ? '#000000' : '#ffffff';
    const margin = props.margin ?? '0';
    return ({
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      maxWidth: `${size}px`,
      maxHeight: `${size}px`,
      backgroundColor: `${bgColor.main}`,
      color: color,
      margin: margin,
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: `${bgColor.dark}`,
      },
      '& .MuiButton-label span': {
        fontSize: `${size / 2}px`,
        color: iconColor,
      }
    });
  }
});

export default CircleButton;
export const defaultSize = 30;
