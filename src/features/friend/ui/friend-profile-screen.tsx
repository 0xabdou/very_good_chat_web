import React, {useEffect, useState} from "react";

import {useLocation, useParams} from "react-router-dom";
import {createStyles, makeStyles} from "@material-ui/core";
import User from "../../user/types/user";
import CommonProfileInfo from "../../user/ui/components/common-profile-info";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {shallowEqual} from "react-redux";
import {useFriendProfileActions} from "../friend-profile-actions-context";
import FriendshipButton from "./components/friendship-button";
import {ErrorSnackbar} from "../../../shared/components/snackbars";
import FriendError, {stringifyFriendError} from "../types/friend-error";
import MoreButton from "./components/more-button";
import {FriendshipStatus} from "../types/friendship";
import ChatButton from "./components/chat-button";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import BackButton from "../../../shared/components/back-button";
import {useMobileMQ} from "../../../shared/styles/media-query";

const FriendProfileScreen = () => {
  const profileState = useAppSelector(state => state.friendProfile, shallowEqual);
  const dispatch = useAppDispatch();
  const actions = useFriendProfileActions();
  const [cachedUser, setCachedUser] = useState<User>();
  const searchResults = useAppSelector(state => state.search.results);
  const routeParams = useParams<{ username: string }>();
  const location = useLocation();
  const isMobile = useMobileMQ();

  useEffect(() => {
    console.log("GETTING: ", routeParams);
    dispatch(actions.getFriendshipInfo(routeParams.username));
    const searchedUser = searchResults?.find(u => u.username == routeParams.username);
    setCachedUser(searchedUser);
    return () => {
      dispatch(actions.reset());
    };
  }, []);

  const classes = useStyles();
  const historyState = location.state as any;
  const one = historyState?.viewingUserFromReceivedRequests;
  const two = historyState?.viewingUserFromSentRequests;
  const user = profileState.user ?? cachedUser;
  return (
    <div className={classes.outer}>
      <MoreButton/>
      <BackButton className={classes.backButton}
                  hide={!isMobile && (one || two)}/>
      <div className={classes.wrapper}>
        {!!user && <CommonProfileInfo user={user}/>}
        <div className={classes.buttonGroup}>
          <FriendshipButton/>
          {profileState.friendship?.status == FriendshipStatus.FRIENDS && user &&
          <ChatButton user={user}/>}
        </div>
      </div>
      <ErrorSnackbar<FriendError>
        currentError={profileState.error}
        stringify={stringifyFriendError}
      />
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    height: '100%',
    width: '100%',
    background: "white",
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center'
  },
  backButton: {
    position: "absolute",
    left: 0,
  }
});

export const useFriendProfileButtonStyles = makeStyles<Theme, { block: boolean }>(createStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '5rem',
    minWidth: '105px',
  },
  marginLeft: {
    marginLeft: '1rem'
  },
  button: props => ({
    '&&': {
      color: props.block ? 'red' : 'black',
      fontSize: '1.8rem'
    }
  }),
  label: props => ({
    color: props.block ? 'red' : 'black',
  }),
}));

export default FriendProfileScreen;