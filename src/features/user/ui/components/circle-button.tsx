import React from "react";
import {
  Button,
  getLuminance,
  Icon,
  makeStyles,
  Theme,
  unstable_createMuiStrictModeTheme as createMuiTheme
} from "@material-ui/core";


export type CircleButtonStyle = {
  size?: number,
  bgColor?: string,
  iconColor?: string,
  disableElevation?: boolean,
};


export type CircleButtonProps = {
  icon: string,
  onClick: () => void,
  className?: string,
  'data-testid'?: string,
} & CircleButtonStyle;

const CircleButton = (props: CircleButtonProps) => {
  const classes = useStyles(props);
  return (
    <Button
      className={`${classes.button} ${props.className ?? ''}`}
      onClick={props.onClick}
      variant='contained'
      data-testid={props["data-testid"]}
      disableElevation={props.disableElevation}
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
    return ({
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      maxWidth: `${size}px`,
      maxHeight: `${size}px`,
      backgroundColor: `${bgColor.main}`,
      color: color,
      borderRadius: '50%',
      padding: 0,
      '&:hover': {
        backgroundColor: `${bgColor.dark}`,
      },
      '& .MuiButton-label span': {
        fontSize: `${size * 0.6}px`,
        color: iconColor,
        margin: 'auto',
      }
    });
  }
});

export default CircleButton;
export const defaultSize = 30;
