import React, {useCallback, useEffect} from "react";
import MainScreen from "./main-screen";
import ProfileUpdatingScreen from "./profile-updating-screen";
import {makeStyles} from "@material-ui/core";
import UserError from "../types/user-error";
import {useUserActions} from "../user-actions-context";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import RetryPage from "../../../components/retry-page";
import FullscreenLoader from "../../../components/fullscreen-loader";
import {Redirect, Route, Switch} from "react-router-dom";
import ProfileScreen from "./profile-screen";
import FriendProfileScreen from "../../friend/ui/friend-profile-screen";
import FriendRequestsScreen from "../../friend/ui/friend-requests-screen";
import {useFriendsActions} from "../../friend/friends-actions-context";
import {useBadgeActions} from "../../badge/badge-actions-context";
import NotificationsScreen from "../../notification/ui/notifications-screen";
import {useNotificationActions} from "../../notification/notification-actions-context";
import FriendsScreen from "../../friend/ui/friends-screen";
import BlockedUsersScreen from "../../block/ui/blocked-users-screen";


const LoggedInScreen = () => {
  const state = useAppSelector(state => state.user);
  const authUser = useAppSelector(state => state.auth.authUser);
  const dispatch = useAppDispatch();
  const {getCurrentUser} = useUserActions();
  const {getFriends, getFriendRequests} = useFriendsActions();
  const {getBadges} = useBadgeActions();
  const {getNotifications} = useNotificationActions();

  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(getFriendRequests());
    dispatch(getFriends());
    dispatch(getNotifications());
    dispatch(getBadges());
  }, []);

  const classes = useStyles();

  const getErrorMessage = () => {
    const error = state.error;
    switch (error) {
      case UserError.network:
        return 'Check your internet connection, and try again!';
      default:
        return 'Something weird happened!';
    }
  };

  const onRetry = useCallback(() => {
    dispatch((getCurrentUser()));
  }, []);
  let child: React.ReactNode;
  if (!state.initialized) {
    if (state.error != null)
      child = <RetryPage onRetry={onRetry} errorMessage={getErrorMessage()}/>;
    else
      child = <FullscreenLoader/>;
  } else {
    if (state.currentUser == null) {
      child = (
        <ProfileUpdatingScreen
          registering
          initialName={authUser?.displayName ?? undefined}
          initialPhotoURL={authUser?.photoURL ?? undefined}
        />
      );
    } else {
      const user = state.currentUser;
      child = (
        <Switch>
          <Route path='/profile'>
            <ProfileScreen/>
          </Route>
          <Route path='/edit-profile'>
            <ProfileUpdatingScreen
              initialUsername={user.username}
              initialName={user.name ?? undefined}
              initialPhotoURL={user.photo?.source}
            />
          </Route>
          <Route path='/blocked-users'><BlockedUsersScreen/></Route>
          <Route path='/friends'><FriendsScreen/></Route>
          <Route path='/requests'><FriendRequestsScreen received/></Route>
          <Route path='/sent-requests'><FriendRequestsScreen/></Route>
          <Route path='/notifications'><NotificationsScreen/></Route>
          <Redirect exact from={`/u/${user.username}`} to='/profile'/>
          <Route path='/u/:username'>
            <FriendProfileScreen/>
          </Route>
          <Route path='/'>
            <MainScreen/>
          </Route>
        </Switch>
      );
    }
  }
  return (
    <div className={classes.root} data-testid='logged-in-screen'>
      {child}
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
});

export default LoggedInScreen;
