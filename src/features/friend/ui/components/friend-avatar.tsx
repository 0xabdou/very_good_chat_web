import {Avatar, Badge, ListItemAvatar, makeStyles} from "@material-ui/core";
import React from "react";
import {formatDate} from "../../../../shared/utils/date-utils";

export type FriendAvatarProps = {
  src: string | undefined,
  lastSeen?: number,
  className?: string,
};

const FriendAvatar = (props: FriendAvatarProps) => {
  const classes = useStyles();

  let online = false;
  let lastSeen: string | undefined;
  if (props.lastSeen) {
    online = new Date().getTime() - props.lastSeen <= 65000;
    lastSeen = formatDate(props.lastSeen, 'mini');
  }
  return (
    <ListItemAvatar>
      <Badge
        variant={online ? 'dot' : 'standard'}
        badgeContent={lastSeen}
        invisible={!online && !lastSeen}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        className={online ? classes.dot : classes.badge}
      >
        <Avatar className={props.className} src={props.src}
                alt='friend-avatar'/>
      </Badge>
    </ListItemAvatar>
  );
};

const useStyles = makeStyles({
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

export default FriendAvatar;