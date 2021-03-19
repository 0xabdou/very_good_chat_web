import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {makeStyles} from "@material-ui/core";
import User from "../../user/types/user";
import CommonProfileInfo from "../../user/ui/components/common-profile-info";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {shallowEqual} from "react-redux";
import {useFriendActions} from "../friend-profile-actions-context";
import FriendshipButton from "./components/friendship-button";

const UserProfileScreen = () => {
  const state = useAppSelector(state => state.friendProfile, shallowEqual);
  const dispatch = useAppDispatch();
  const actions = useFriendActions();
  const [cachedUser, setCachedUser] = useState<User>();
  const searchResults = useAppSelector(state => state.search.results);
  const routeParams = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(actions.getFriendshipInfo(routeParams.id));
    const searchedUser = searchResults?.find(u => u.username == routeParams.id);
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
        {!!state.error && state.error}
      </div>
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

export default UserProfileScreen;