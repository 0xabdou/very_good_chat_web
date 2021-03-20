import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {makeStyles} from "@material-ui/core";
import User from "../../user/types/user";
import CommonProfileInfo from "../../user/ui/components/common-profile-info";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {shallowEqual} from "react-redux";
import {useFriendActions} from "../friend-profile-actions-context";
import FriendshipButton from "./components/friendship-button";
import {ErrorSnackbar} from "../../../components/snackbars";
import FriendError from "../types/friend-error";


const FriendProfileScreen = () => {
  const state = useAppSelector(state => state.friendProfile, shallowEqual);
  const dispatch = useAppDispatch();
  const actions = useFriendActions();
  const [cachedUser, setCachedUser] = useState<User>();
  const searchResults = useAppSelector(state => state.search.results);
  const routeParams = useParams<{ username: string }>();

  useEffect(() => {
    dispatch(actions.getFriendshipInfo(routeParams.username));
    const searchedUser = searchResults?.find(u => u.username == routeParams.username);
    setCachedUser(searchedUser);
    return () => {
      dispatch(actions.reset());
    };
  }, []);

  const classes = useStyles();

  const user = state.user ?? cachedUser;
  return (
    <div className={classes.outer}>
      <div className={classes.wrapper}>
        {!!user && <CommonProfileInfo user={user}/>}
        <FriendshipButton/>
      </div>
      <ErrorSnackbar<FriendError>
        currentError={state.error}
        stringify={stringifyError}
        exclude={[]}
      />
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
  },
});

export const stringifyError = (e: FriendError | null) => {
  switch (e) {
    case FriendError.alreadyFriends:
      return "You're already friends";
    case FriendError.requestRemoved:
      return "This request was deleted";
    case FriendError.requestAlreadyReceived:
      return "This user already sent you a request";
    case FriendError.network:
      return "Check your internet";
    default:
      return "Something weird happened";
  }
};

export default FriendProfileScreen;