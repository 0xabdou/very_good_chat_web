import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {createStyles, makeStyles} from "@material-ui/core";
import User from "../../user/types/user";
import CommonProfileInfo from "../../user/ui/components/common-profile-info";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {shallowEqual} from "react-redux";
import {useFriendProfileActions} from "../friend-profile-actions-context";
import FriendshipButton from "./components/friendship-button";
import {ErrorSnackbar} from "../../../components/snackbars";
import FriendError, {stringifyFriendError} from "../types/friend-error";
import MoreButton from "./components/more-button";
import {FriendshipStatus} from "../types/friendship";
import ChatButton from "./components/chat-button";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

const FriendProfileScreen = () => {
  const state = useAppSelector(state => state.friendProfile, shallowEqual);
  const dispatch = useAppDispatch();
  const actions = useFriendProfileActions();
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
      <MoreButton/>
      <div className={classes.wrapper}>
        {!!user && <CommonProfileInfo user={user}/>}
        <div className={classes.buttonGroup}>
          <FriendshipButton/>
          {state.friendship?.status == FriendshipStatus.FRIENDS && user &&
          <ChatButton user={user}/>}
        </div>
      </div>
      <ErrorSnackbar<FriendError>
        currentError={state.error}
        stringify={stringifyFriendError}
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
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center'

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