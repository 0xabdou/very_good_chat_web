import React, {useCallback} from "react";
import User from "../../../user/types/user";
import {
  Avatar,
  Badge,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {formatDate} from "../../../../shared/utils/date-utils";
import Friend from "../../types/friend";

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
  let online = false;
  let lastSeen: string | undefined;
  if (friend.lastSeen) {
    online = new Date().getTime() - friend.lastSeen <= 6000;
    lastSeen = formatDate(friend.lastSeen, 'mini');
  }
  return (
    <div style={props.style} data-testid='friend-list-item'>
      <ListItem
        className={classes.item}
        onClick={onClick}
        button>
        <ListItemAvatar>
          <Badge
            variant={online ? 'dot' : 'standard'}
            badgeContent={lastSeen}
            invisible={!online && !lastSeen}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            className={online ? classes.dot : classes.badge}
          >
            <Avatar src={user.photo?.small} alt='friend-avatar'/>
          </Badge>
        </ListItemAvatar>
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
  dot: {
    '& .MuiBadge-badge': {
      background: '#5dda4e',
      color: 'white',
    },
    '& .MuiBadge-dot': {
      border: '1px solid white',
      borderRadius: '50%',
      height: '14px',
      width: '14px',
      margin: '5px',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      background: '#317529',
      color: 'white',
      fontSize: '0.5rem',
      border: '1px solid white',
      margin: '2px',
    }
  }
});

export default FriendListItem;