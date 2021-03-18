import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {makeStyles} from "@material-ui/core";
import User from "../../user/types/user";
import CommonProfileInfo from "../../user/ui/components/common-profile-info";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {shallowEqual} from "react-redux";
import {useFriendActions} from "../friend-profile-actions-context";
import {PulseLoader} from "react-spinners";

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
  }, []);

  const classes = useStyles();

  const user = state.user ?? cachedUser;
  return (
    <div className={classes.wrapper}>
      <div className={classes.outer}>
        {!!user && <CommonProfileInfo user={user}/>}
        {state.loading && <PulseLoader/>}
        {!!state.friendship && state.friendship.status}
        {!!state.error && state.error}
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  outer: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
  },
});

export default UserProfileScreen;