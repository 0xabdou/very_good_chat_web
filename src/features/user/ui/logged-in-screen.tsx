import React, {useCallback, useEffect} from "react";
import MainScreen from "./main-screen";
import ProfileUpdatingScreen from "./profile-updating-screen";
import {makeStyles} from "@material-ui/core";
import UserError from "../types/user-error";
import {useMeActions} from "../me-actions-context";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import RetryPage from "../../../shared/components/retry-page";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
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
import SettingsScreen from "../../settings/ui/settings-screen";
import {startPolling} from "../../../shared/utils/polling";
import useChatActions from "../../chat/chat-actions-provider";
import ConversationScreen from "../../chat/ui/conversation-screen";

const LoggedInScreen = () => {
  const state = useAppSelector(state => state.me);
  const authUser = useAppSelector(state => state.auth.authUser);
  const dispatch = useAppDispatch();
  const {getMe, updateLastSeen} = useMeActions();
  const {getFriends, getFriendRequests} = useFriendsActions();
  const {getBadges} = useBadgeActions();
  const {getNotifications} = useNotificationActions();
  const {getConversations, subscribeToMessages} = useChatActions();

  useEffect(() => {
    dispatch(getMe());
    dispatch(getConversations());
    dispatch(subscribeToMessages());
    dispatch(getBadges());
    startPolling(() => {
      dispatch(getFriendRequests());
      dispatch(getFriends());
      dispatch(getNotifications());
      dispatch(updateLastSeen());
    });
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
    dispatch((getMe()));
  }, []);
  let child: React.ReactNode;
  if (!state.initialized) {
    if (state.error != null)
      child = <RetryPage onRetry={onRetry} errorMessage={getErrorMessage()}/>;
    else
      child = <FullscreenLoader/>;
  } else {
    if (state.me == null) {
      child = (
        <ProfileUpdatingScreen
          registering
          initialName={authUser?.displayName ?? undefined}
          initialPhotoURL={authUser?.photoURL ?? undefined}
        />
      );
    } else {
      const me = state.me;
      child = (
        <Switch>
          <Route path='/profile'>
            <ProfileScreen/>
          </Route>
          <Route path='/edit-profile'>
            <ProfileUpdatingScreen
              initialUsername={me.username}
              initialName={me.name ?? undefined}
              initialPhotoURL={me.photo?.source}
            />
          </Route>
          <Route path='/blocked-users'><BlockedUsersScreen/></Route>
          <Route path='/friends'><FriendsScreen/></Route>
          <Route path='/requests'><FriendRequestsScreen received/></Route>
          <Route path='/sent-requests'><FriendRequestsScreen/></Route>
          <Route path='/notifications'><NotificationsScreen/></Route>
          <Route path='/settings'><SettingsScreen/></Route>
          <Redirect exact from={`/u/${me.username}`} to='/profile'/>
          <Route path='/u/:username'>
            <FriendProfileScreen/>
          </Route>
          <Route path='/c/:id'>
            <ConversationScreen/>
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
