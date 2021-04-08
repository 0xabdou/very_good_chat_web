import {Badge, Icon, IconButton, makeStyles} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useTopBarStyles} from "../../../user/ui/components/top-bar";
import {useAppSelector} from "../../../../core/redux/hooks";

const Badges = () => {
  const badgeState = useAppSelector(state => state.badge);
  const friendRequests = useAppSelector(state => state.friends.friendRequests);
  const notifications = useAppSelector(state => state.notification.notifications);
  const [requestCount, setRequestCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    if (!badgeState.friendRequests || !friendRequests) {
      setRequestCount(0);
    } else {
      let count = 0;
      const reqs = friendRequests.received;
      for (let req of reqs) {
        if (req.date < badgeState.friendRequests)
          break;
        count++;
      }
      setRequestCount(count);
    }
  }, [badgeState, friendRequests]);

  useEffect(() => {
    if (!badgeState.notifications || !notifications) {
      setNotifCount(0);
    } else {
      let count = 0;
      for (let notif of notifications) {
        if (notif.date < badgeState.notifications)
          break;
        count++;
      }
      setNotifCount(count);
    }
  }, [badgeState, notifications]);

  const goToRequests = useCallback(() => {
    history.push('/requests');
  }, [history]);

  const goToNotifications = useCallback(() => {
    history.push('/notifications');
  }, [history]);

  return (
    <div>
      <IconButton
        className={topBarClasses.actionButton}
        onClick={goToRequests}
        data-testid='friend-requests-button'
      >
        <Badge badgeContent={requestCount} className={classes.badge}>
          <Icon>people</Icon>
        </Badge>
      </IconButton>
      <IconButton
        className={topBarClasses.actionButton}
        onClick={goToNotifications}
        data-testid='notifications-button'
      >
        <Badge badgeContent={notifCount} className={classes.badge}>
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>
    </div>
  );
};

const useStyles = makeStyles({
  badge: {
    '& .MuiBadge-badge': {
      background: 'red',
      color: 'white',
    }
  }
});

export default Badges;