import {Badge, Icon, IconButton, makeStyles} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useTopBarStyles} from "../../../user/ui/components/top-bar";
import {useAppDispatch, useAppSelector} from "../../../../store/hooks";
import {useBadgeActions} from "../../badge-actions-context";
import {BadgeName} from "../../types/badge";

const Badges = () => {
  const badgeState = useAppSelector(state => state.badge);
  const friendRequests = useAppSelector(state => state.friends.friendRequests);
  const [requestCount, setRequestCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const actions = useBadgeActions();
  const dispatch = useAppDispatch();
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

  const goToRequests = useCallback(() => {
    dispatch(actions.updateBadge(BadgeName.FRIEND_REQUESTS));
    history.push('/requests');
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