import React, {useCallback, useEffect} from "react";
import {Button, makeStyles, Typography} from "@material-ui/core";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {PulseLoader} from "react-spinners";
import RetryButton from "../../user/ui/components/retry-button";
import {useFriendsActions} from "../friends-actions-context";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import RequestListItem from "./components/request-list-item";
import User from "../../user/types/user";
import {useHistory} from "react-router-dom";
import {stringifyFriendError} from "../types/friend-error";
import {ErrorSnackbar} from "../../../components/snackbars";
import {FriendRequest} from "../types/friend-request";

type FriendRequestsScreenProps = {
  received?: boolean
};

const FriendRequestsScreen = (props: FriendRequestsScreenProps) => {
  const state = useAppSelector(state => state.friends);
  const dispatch = useAppDispatch();
  const actions = useFriendsActions();
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    if (state.error == null && !state.friendRequests) {
      dispatch(actions.getFriendRequests());
    }
  }, []);

  const goToUserProfile = useCallback((user: User) => {
    history.push(`/u/${user.username}`);
  }, [history]);

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
            height={height}
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
  } else if (state.error != null) {
    child = (
      <div className={classes.centered}>
        <RetryButton
          onClick={retry}
          message={stringifyFriendError(state.error)}
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
      <TopBar>
        <Typography variant='h6' className={topBarClasses.title}>
          {props.received ? 'Friend requests' : 'Sent requests'}
        </Typography>
      </TopBar>
      {props.received &&
      <div className={classes.sent} data-testid='view-sent-requests'>
        <Button onClick={viewSentReqs}>View sent requests</Button>
      </div>}
      {child}
      <ErrorSnackbar
        currentError={state.error}
        stringify={stringifyFriendError}
        exclude={[]}
      />
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
  centered: {
    margin: 'auto',
  },
  sent: {
    display: 'flex',
    justifyContent: 'center',
  }
});

export default FriendRequestsScreen;