import React, {useCallback, useEffect} from "react";
import {Button, makeStyles, Typography} from "@material-ui/core";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {PulseLoader} from "react-spinners";
import RetryButton from "../../../shared/components/retry-button";
import {useFriendsActions} from "../friends-actions-context";
import {useTopBarStyles} from "../../user/ui/components/top-bar";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import RequestListItem from "./components/request-list-item";
import User from "../../user/types/user";
import {Route, useHistory} from "react-router-dom";
import {stringifyFriendError} from "../types/friend-error";
import {ErrorSnackbar} from "../../../shared/components/snackbars";
import {FriendRequest} from "../types/friend-request";
import {BadgeName} from "../../badge/types/badge";
import {useBadgeActions} from "../../badge/badge-actions-context";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {useLargeMQ, useMobileMQ} from "../../../shared/styles/media-query";
import FriendProfileScreen from "./friend-profile-screen";

type FriendRequestsScreenProps = {
  received?: boolean
};

const FriendRequestsScreen = (props: FriendRequestsScreenProps) => {
  const state = useAppSelector(state => state.friends);
  const dispatch = useAppDispatch();
  const actions = useFriendsActions();
  const {updateBadge} = useBadgeActions();
  const history = useHistory();
  const isMobile = useMobileMQ();
  const isLarge = useLargeMQ();
  const classes = useStyles({isMobile, isLarge});
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    if (props.received) {
      dispatch(updateBadge(BadgeName.FRIEND_REQUESTS));
    }
  }, [props.received]);

  const goToUserProfile = useCallback((user: User) => {
    const pathname = `/u/${user.username}`;
    if (history.location.pathname != pathname) {
      history.push({
        pathname,
        state: {
          viewingUserFromReceivedRequests: props.received,
          viewingUserFromSentRequests: !props.received,
        }
      });
    }
  }, [history, props.received]);

  const cancelRequest = useCallback((user: User) => {
    dispatch(actions.cancelFriendRequest(user.id));
  }, [history]);

  const acceptRequest = useCallback((user: User) => {
    dispatch(actions.acceptFriendRequest(user.id));
  }, [history]);

  const declineRequest = useCallback((user: User) => {
    dispatch(actions.declineFriendRequest(user.id));
  }, [history]);

  const retry = useCallback(() => {

  }, []);

  const viewSentReqs = useCallback(() => {
    history.push('/sent-requests');
  }, []);

  const itemKey = useCallback((index: number, data: FriendRequest[]) => {
    return data[index].user.username;
  }, [state.friendRequests]);

  let child: React.ReactNode;
  if (state.friendRequests) {
    const reqs = props.received
      ? state.friendRequests.received
      : state.friendRequests.sent;
    if (reqs.length) {
      child = <AutoSizer>
        {({height, width}) => {
          return <FixedSizeList
            itemCount={reqs.length}
            itemData={reqs}
            itemKey={itemKey}
            height={height - 50}
            width={width}
            itemSize={72}
          >
            {({index, style, data}) => {
              const req: FriendRequest = data[index];
              const treated = state.beingTreated.find(id => id == req.user.id);
              const loading = treated != undefined;
              return (
                <RequestListItem
                  style={style}
                  req={req}
                  onClick={goToUserProfile}
                  onAccept={acceptRequest}
                  onCancel={props.received ? declineRequest : cancelRequest}
                  received={props.received}
                  loading={loading}
                />
              );
            }}
          </FixedSizeList>;
        }}
      </AutoSizer>;
    } else {
      child = (
        <div className={classes.centered} data-testid='no-requests'>
          <span>No requests for the moment</span>
        </div>
      );
    }
  } else if (state.requestsError != null) {
    child = (
      <div className={classes.centered}>
        <RetryButton
          onClick={retry}
          message={stringifyFriendError(state.requestsError)}
        />
      </div>
    );
  } else {
    child = (
      <div className={classes.centered} data-testid='requests-loading'>
        <PulseLoader/>
      </div>
    );
  }
  return (
    <div className={classes.outer}>
      <div className={classes.leftSection}>
        <div className={classes.leftSectionTopBar}>
          <Typography variant='h6' className={topBarClasses.title}>
            {props.received ? 'Friend requests' : 'Sent requests'}
          </Typography>
        </div>
        {props.received &&
        <div className={classes.sent} data-testid='view-sent-requests'>
          <Button onClick={viewSentReqs}>View sent requests</Button>
        </div>}
        {child}
        <ErrorSnackbar
          currentError={state.requestsError}
          stringify={stringifyFriendError}
          exclude={[]}
        />
      </div>
      <div className={classes.rightSection}>
        <Route path="/u/:username">
          <FriendProfileScreen/>
        </Route>
        <span className={classes.filler}>
          Click on a request to see the user
        </span>
      </div>
    </div>
  );
};

type MainScreenStyle = {
  isMobile: boolean,
  isLarge: boolean,
}

const useStyles = makeStyles<Theme, MainScreenStyle>({
  outer: {
    position: "relative",
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  centered: {
    margin: 'auto',
  },
  sent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: "50px",
  },
  leftSection: props => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: props.isMobile
      ? "100%"
      : props.isLarge ? "35%" : "40%",
    minWidth: "300px",
    borderRight: "0.1px solid rgba(0,0,0,0.1)",
    paddingTop: "56px",
    height: "100%",
  }),
  leftSectionTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    display: "flex",
    padding: "8px 16px",
    alignItems: "center",
    width: "100%",
  },
  rightSection: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  filler: {
    position: "absolute",
    color: "black",
    zIndex: -1,
  }
});

export default FriendRequestsScreen;