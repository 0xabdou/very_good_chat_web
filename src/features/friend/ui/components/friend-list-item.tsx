import React, {useCallback} from "react";
import User from "../../../user/types/user";
import {ListItem, ListItemText, makeStyles} from "@material-ui/core";
import Friend from "../../types/friend";
import FriendAvatar from "./friend-avatar";

export type FriendListItemProps = {
  friend: Friend,
  style?: React.CSSProperties
  onClick?: (user: User) => void,
}

const FriendListItem = (props: FriendListItemProps) => {
  const friend = props.friend;
  const user = friend.user;

  const onClick = useCallback(() => {
    if (props.onClick) props.onClick(user);
  }, [props.onClick]);

  const classes = useStyles();
  return (
    <div style={props.style} data-testid='friend-list-item'>
      <ListItem
        className={classes.item}
        onClick={onClick}
        button>
        <FriendAvatar
          src={friend.user.photo?.small}
          lastSeen={friend.lastSeen}
        />
        <ListItemText
          primary={user.username}
          secondary={user.name}
        />
      </ListItem>
    </div>
  );
};

const useStyles = makeStyles({
  item: {
    position: 'relative',
    minHeight: '72px'
  },
  actions: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  clear: {
    color: 'red'
  },
  check: {
    color: 'green'
  },
});

export default FriendListItem;