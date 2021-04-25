import {Badge, Icon, IconButton, makeStyles, Popover} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useAppSelector} from "../../../../core/redux/hooks";
import NotificationsScreen from "../../../notification/ui/notifications-screen";
import {useMobileMQ} from "../../../../shared/styles/media-query";

const Badges = () => {
  const badgeState = useAppSelector(state => state.badge);
  const friendRequests = useAppSelector(state => state.friends.friendRequests);
  const notifications = useAppSelector(state => state.notification.notifications);
  const [requestCount, setRequestCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const history = useHistory();
  const [notifAnchor, setNotifAnchor] = useState<HTMLButtonElement | null>(null);
  const isMobile = useMobileMQ();
  const classes = useStyles();

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

  const notifClicked = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) history.push('/notifications', {canGoBack: true});
    else setNotifAnchor(event.currentTarget);
  }, [history, isMobile]);

  const reqClicked = useCallback(() => {
    history.push('/requests', {canGoBack: true});
  }, [history]);

  const closeNotif = useCallback(() => {
    setNotifAnchor(null);
  }, [setNotifAnchor]);

  return (
    <div>
      <IconButton
        className={classes.button}
        onClick={reqClicked}
        aria-describedby="req"
        data-testid='friend-requests-button'
      >
        <Badge badgeContent={requestCount} className={classes.badge}>
          <Icon>people</Icon>
        </Badge>
      </IconButton>
      <IconButton
        className={classes.button}
        onClick={notifClicked}
        aria-describedby="notif"
        data-testid='notifications-button'
      >
        <Badge badgeContent={notifCount} className={classes.badge}>
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>
      <Popover
        id="notif"
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={closeNotif}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={classes.menu}>
          <NotificationsScreen/>
        </div>
      </Popover>
    </div>
  );
};

const useStyles = makeStyles({
  button: {
    color: 'black',
    padding: 6,
    margin: 6,
    '& .material-icons': {
      fontSize: '1.8rem'
    }
  },
  badge: {
    '& .MuiBadge-badge': {
      background: 'red',
      color: 'white',
    }
  },
  menu: {
    display: "flex",
    width: "360px",
    height: "400px",
    minHeight: "500px",
  }
});

export default Badges;