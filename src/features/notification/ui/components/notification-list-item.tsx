import React, {useCallback} from "react";
import {
  isRequestAcceptedNotification,
  isSystemNotification,
  Notification
} from "../../types/notification";
import {
  Avatar,
  createStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {formatDate} from "../../../../utils/date-utils";

export type NotificationListItemProps = {
  notification: Notification,
  onClick: (notification: Notification) => void,
  style?: React.CSSProperties,
}

const NotificationListItem = (props: NotificationListItemProps) => {
  const classes = useStyles({seen: props.notification.seen});

  const onClick = useCallback(
    () => props.onClick(props.notification),
    [props.onClick, props.notification]
  );

  const vm = getViewModel(props.notification, classes);
  return (
    <ListItem style={props.style} onClick={onClick} button
              data-testid='notification-list-item'>
      <ListItemAvatar>
        <Avatar src={vm.avatar} alt='notification-avatar'/>
      </ListItemAvatar>
      <ListItemText
        primary={vm.primary}
        secondary={vm.secondary}
      />
      {!vm.seen && <div className={classes.dot}/>}
    </ListItem>
  );
};

type StyleProps = {
  seen: boolean
}
const useStyles = makeStyles<Theme, StyleProps>(() => {
  const blue = '#2F88FB';
  return createStyles({
    dot: {
      maxHeight: '10px',
      maxWidth: '10px',
      minHeight: '10px',
      minWidth: '10px',
      borderRadius: '50%',
      background: blue
    },
    primaryBold: props => {
      let color: string;
      if (props.seen) {
        color = 'grey';
      } else {
        color = 'black';
      }
      return {
        fontWeight: 'bold',
        color,
      };
    },
    primaryNormal: props => {
      let color: string;
      if (props.seen) {
        color = 'rgba(0,0,0,0.7)';
      } else {
        color = 'black';
      }
      return {
        color,
      };
    },
    secondary: props => {
      if (props.seen) return {};
      return {
        color: blue,
        fontWeight: 'bold'
      };
    },
  });
});

type ViewModel = {
  avatar?: string,
  primary: React.ReactNode,
  secondary: React.ReactNode,
  seen: boolean
}

const getViewModel = (
  notification: Notification,
  classes: ReturnType<typeof useStyles>
): ViewModel => {
  const content = notification.content;
  if (isRequestAcceptedNotification(content)) {
    const user = content.user;
    const primary = (
      <div>
        <span className={classes.primaryBold}>{user.username}</span>
        <span
          className={classes.primaryNormal}> accepted your friend request</span>
      </div>
    );
    const secondary = (
      <span className={classes.secondary}>
        {formatDate(notification.date)}
      </span>
    );
    return {
      avatar: user.photo?.small,
      primary,
      secondary: secondary,
      seen: notification.seen
    };
  }
  if (isSystemNotification(content)) {
    return {
      primary: content.message,
      secondary: formatDate(notification.date),
      seen: notification.seen,
    };
  }
  throw new Error('Unsupported notification type: ' + notification.content.type);
};

export default NotificationListItem;