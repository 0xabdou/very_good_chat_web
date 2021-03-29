import React, {useCallback} from "react";
import {Block} from "../../types/block";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";

export type BlockedListItemProps = {
  block: Block,
  onClick: (block: Block) => void,
  style?: React.CSSProperties
};

const BlockedListItem = (props: BlockedListItemProps) => {
  const classes = useStyles();

  const onClick = useCallback(() => {
    props.onClick(props.block);
  }, [props]);

  return (
    <div style={props.style} data-testid='blocked-list-item'>
      <ListItem
        className={classes.listItem}
        onClick={onClick}
        button>
        <ListItemAvatar>
          <Avatar
            src={props.block.user.photo?.small}
            alt='blocked-profile-picture'/>
        </ListItemAvatar>
        <ListItemText primary={props.block.user.username}/>
      </ListItem>
    </div>
  );
};

const useStyles = makeStyles({
  listItem: {
    minHeight: '72',
    maxHeight: '72',
    position: 'relative',
  }
});

export default BlockedListItem;