import React, {useCallback, useEffect} from "react";
import {makeStyles, Typography} from "@material-ui/core";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {PulseLoader} from "react-spinners";
import RetryButton from "../../../shared/components/retry-button";
import {useFriendsActions} from "../friends-actions-context";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import User from "../../user/types/user";
import {useHistory} from "react-router-dom";
import {stringifyFriendError} from "../types/friend-error";
import FriendListItem from "./components/friend-list-item";
import BackButton from "../../../shared/components/back-button";

const FriendsScreen = () => {
  const friends = useAppSelector(state => state.friends.friends);
  const error = useAppSelector(state => state.friends.friendsError);
  const dispatch = useAppDispatch();
  const actions = useFriendsActions();
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    dispatch(actions.getFriends());
  }, []);

  const goToUserProfile = useCallback((user: User) => {
    history.push(`/u/${user.username}`, {canGoBack: true});
  }, [history]);

  const retry = useCallback(() => {
    dispatch(actions.getFriends());
  }, []);

  let child: React.ReactNode;
  if (friends) {
    if (friends.length) {
      child = (
        <div className={classes.friends}>
          {friends.map(friend => {
            return <FriendListItem
              friend={friend}
              onClick={goToUserProfile}
              key={friend.user.id}
            />;
          })}
        </div>
      );
    } else {
      child = (
        <div className={classes.centered} data-testid='no-friends'>
          <span>You have no friends :(</span>
        </div>
      );
    }
  } else if (error != null) {
    child = (
      <div className={classes.centered}>
        <RetryButton
          onClick={retry}
          message={stringifyFriendError(error)}
        />
      </div>
    );
  } else {
    child = (
      <div className={classes.centered} data-testid='friends-loading'>
        <PulseLoader/>
      </div>
    );
  }
  return (
    <div className={classes.outer}>
      <TopBar>
        <BackButton/>
        <Typography variant='h6' className={topBarClasses.title}>
          Friends
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
    flexDirection: 'column',
    paddingTop: '56px',
  },
  friends: {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  centered: {
    margin: 'auto',
  },
});

export default FriendsScreen;