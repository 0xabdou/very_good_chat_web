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
import {useLargeMQ, useMobileMQ} from "../../../shared/styles/media-query";
import FriendProfileScreen from "./friend-profile-screen";
import ResponsiveTwoSides from "../../user/ui/responsive-two-sides";

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
  const leftTopBar = (
    <Typography variant='h6' className={topBarClasses.title}>
      {props.received ? 'Friend requests' : 'Sent requests'}
    </Typography>
  );
  const leftChildren = (
    <>
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
    </>
  );
  const rightChildren = (
    <Route path="/u/:username">
      <FriendProfileScreen/>
    </Route>
  );
  const rightFiller = "Click on a request to see the user";
  return (
    <ResponsiveTwoSides
      leftTopBar={leftTopBar}
      leftChildren={leftChildren}
      rightChildren={rightChildren}
      rightFiller={rightFiller}
    />
  );
};

const useStyles = makeStyles({
  centered: {
    margin: 'auto',
  },
  sent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: "50px",
  },
});

export default FriendRequestsScreen;