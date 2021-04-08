import React from "react";
import {Menu, MenuProps} from "@material-ui/core";

const GenericMenu = (props: MenuProps) => {
  return (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  );
};

export default GenericMenu;