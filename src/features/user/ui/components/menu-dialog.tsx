import {Button, Dialog, Icon, makeStyles} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles({
  wrapper: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
  },
  item: {
    display: 'flex',
    justifyContent: 'left',
  }
});

type MenuDialogProps = {
  visible: boolean,
  items: MenuDialogItemProps[],
  onClose: () => void,
};

const MenuDialog = (props: MenuDialogProps) => {

  const classes = useStyles();

  const menuItems = props.items.map(
    (item, idx) => <MenuDialogItem className={classes.item} {...item} key={idx}/>
  );

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      aria-labelledby="simple-dialog-title">
      <div className={classes.wrapper}>
        {menuItems}
      </div>
    </Dialog>
  );
};

export type MenuDialogItemProps = {
  icon: string,
  label: string,
  onClick: () => void,
  className?: string,
};

const MenuDialogItem = (props: MenuDialogItemProps) => {
  return (
    <Button
      className={props.className}
      startIcon={<Icon>{props.icon}</Icon>}
      onClick={props.onClick}
      data-testid={`profile-photo-${props.icon}`}
    >
      {props.label}
    </Button>
  );
};

export default MenuDialog;