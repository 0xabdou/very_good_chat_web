import React, {useCallback, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {PulseLoader} from "react-spinners";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import NotificationListItem from "./components/notification-list-item";
import {Notification, NotificationType} from "../types/notification";
import {useNotificationActions} from "../notification-actions-context";
import {makeStyles, Typography} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {stringifyNotificationError} from "../types/notification-error";
import {useBadgeActions} from "../../badge/badge-actions-context";
import {BadgeName} from "../../badge/types/badge";

const NotificationsScreen = () => {
  const state = useAppSelector(state => state.notification);
  const dispatch = useAppDispatch();
  const actions = useNotificationActions();
  const {updateBadge} = useBadgeActions();
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    dispatch(updateBadge(BadgeName.NOTIFICATIONS));
  }, []);

  const onClick = useCallback((notification: Notification) => {
    dispatch(actions.markNotificationAsSeen(notification.id));
    if (notification.content.type == NotificationType.REQUEST_ACCEPTED) {
      history.push(`/u/${notification.content.user.username}`);
    }
  }, []);

  let child: React.ReactNode;
  if (state.error == null && state.notifications == null) {
    child = (
      <div className={classes.centered} data-testid='notifications-loading'>
        <PulseLoader/>
      </div>
    );
  } else if (state.notifications) {
    if (state.notifications.length) {
      child = <AutoSizer>
        {({height, width}) => {
          return <FixedSizeList
            itemCount={state.notifications!.length}
            itemData={state.notifications}
            height={height}
            width={width}
            itemSize={80}
          >
            {({index, style, data}) => {
              return (
                <NotificationListItem
                  notification={data[index]}
                  onClick={onClick}
                  style={style}/>
              );
            }}
          </FixedSizeList>;
        }}
      </AutoSizer>;
    } else {
      child = (
        <span className={classes.centered} data-testid='empty-notifications'>
         No notifications
       </span>
      );

    }
  } else {
    child = (
      <span className={classes.centered} data-testid='notifications-error'>
        {stringifyNotificationError(state.error!)}
      </span>
    );
  }
  return (
    <div className={classes.outer}>
      <TopBar>
        <Typography variant='h6' className={topBarClasses.title}>
          Notifications
        </Typography>
      </TopBar>
      {child}
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    paddingTop: '56px',
  },
  centered: {
    margin: 'auto',
  }
});

export default NotificationsScreen;