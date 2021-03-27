import React, {useCallback, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../store/hooks";
import {Icon, IconButton, makeStyles, MenuItem} from "@material-ui/core";
import {Friendship, FriendshipStatus} from "../../types/friendship";
import {PulseLoader} from "react-spinners";
import {useFriendProfileActions} from "../../friend-profile-actions-context";
import FriendError from "../../types/friend-error";
import AlertDialog from "../../../../components/alert-dialog";
import GenericMenu from "../../../../components/generic-menu";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

const FriendshipButton = () => {
  const state = useAppSelector(state => state.friendProfile);
  const dispatch = useAppDispatch();
  const actions = useFriendProfileActions();
  const [anchorEl1, setAnchorEl1] = useState<HTMLElement | null>(null);
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const [anchorEl3, setAnchorEl3] = useState<HTMLElement | null>(null);
  const [alerting, setAlerting] = useState(false);

  const classes = useStyles({
    block: (state.friendship?.status == FriendshipStatus.BLOCKING
      || state.friendship?.status == FriendshipStatus.BLOCKED)
  });

  const onClose = useCallback(() => {
    setAnchorEl1(null);
    setAnchorEl2(null);
    setAnchorEl3(null);
  }, []);

  const handleError = async (promise: Promise<{
    meta: { requestStatus: 'fulfilled' | 'rejected' }
    payload: Friendship | FriendError | undefined
  }>) => {
    const result = await promise;
    if (result.meta.requestStatus == 'rejected') {
      dispatch(actions.getFriendshipInfo(state.user!.username));
    }
  };

  const sendFR = useCallback(() => {
    void handleError(dispatch(actions.sendFriendRequest()));
  }, [state.user]);

  const cancelFR = useCallback(() => {
    setAnchorEl2(null);
    void handleError(dispatch(actions.cancelFriendRequest()));
  }, [state.user]);

  const acceptFR = useCallback(() => {
    setAnchorEl1(null);
    void handleError(dispatch(actions.acceptFriendRequest()));
  }, [state.user]);

  const declineFR = useCallback(() => {
    setAnchorEl1(null);
    void handleError(dispatch(actions.declineFriendRequest()));
  }, [state.user]);

  const onRequestSentTapped = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(e.currentTarget);
  }, []);

  const onRequestReceivedTapped = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl1(e.currentTarget);
  }, []);

  const askForUnfriendConfirmation = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl3(e.currentTarget);
  }, []);

  const onUnfriendTapped = useCallback(() => {
    setAlerting(true);
    onClose();
  }, []);

  const onUnfriendCanceled = useCallback(() => {
    setAlerting(false);
  }, []);

  const onUnfriendConfirmed = useCallback(() => {
    setAlerting(false);
    void handleError(dispatch(actions.unfriend()));
  }, [state.user]);

  let child: React.ReactElement;
  if (state.loading || !state.friendship) {
    child = <PulseLoader/>;
  } else {
    let icon: string;
    let label: string | undefined;
    let onTap: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
    let disabled = false;
    switch (state.friendship.status) {
      case FriendshipStatus.STRANGERS:
        icon = 'fas fa-user-plus';
        label = 'Add friend';
        onTap = sendFR;
        break;
      case FriendshipStatus.FRIENDS:
        icon = 'fas fa-user-check';
        label = "You're friends!";
        onTap = askForUnfriendConfirmation;
        break;
      case FriendshipStatus.REQUEST_SENT:
        icon = 'fas fa-user-clock';
        label = 'Request sent!';
        onTap = onRequestSentTapped;
        break;
      case FriendshipStatus.REQUEST_RECEIVED:
        icon = 'fas fa-user-clock';
        label = 'Answer request!';
        onTap = onRequestReceivedTapped;
        break;
      case FriendshipStatus.BLOCKING:
        icon = 'fas fa-ban';
        label = 'You blocked this user!';
        disabled = true;
        break;
      case FriendshipStatus.BLOCKED:
        icon = 'fas fa-ban';
        label = 'This user blocked you!';
        disabled = true;
        break;
    }
    child = (
      <>
        <IconButton
          className={classes.button}
          aria-controls="customized-menu"
          aria-haspopup="true"
          onClick={onTap}
          disabled={disabled || state.modifyingFriendship}
          data-testid={icon}
        >
          <i className={icon}/>
        </IconButton>
        <span className={classes.blockText}>{label}</span>
      </>
    );
  }
  return (
    <div className={classes.wrapper} data-testid='friendship-button'>
      {child}
      <GenericMenu
        anchorEl={anchorEl1}
        open={Boolean(anchorEl1)}
        onClose={onClose}
      >
        <MenuItem onClick={acceptFR} data-testid='accept request'>
          <Icon className={classes.checkIcon}>check</Icon>
          Accept
        </MenuItem>
        <MenuItem onClick={declineFR} data-testid='decline request'>
          <Icon className={classes.clearIcon}>clear</Icon>
          Decline
        </MenuItem>
      </GenericMenu>
      <GenericMenu
        anchorEl={anchorEl2}
        open={Boolean(anchorEl2)}
        onClose={onClose}
      >
        <MenuItem onClick={cancelFR} data-testid='cancel request'>
          <Icon className={classes.clearIcon}>clear</Icon>
          Cancel
        </MenuItem>
      </GenericMenu>
      <GenericMenu
        anchorEl={anchorEl3}
        open={Boolean(anchorEl3)}
        onClose={onClose}
      >
        <MenuItem onClick={onUnfriendTapped} data-testid='unfriend'>
          <Icon className={classes.clearIcon}>clear</Icon>
          Remove friend
        </MenuItem>
      </GenericMenu>
      <AlertDialog
        title='Unfriend'
        content='Are you sure you want to remove this friend?'
        open={alerting}
        onCancel={onUnfriendCanceled}
        onConfirm={onUnfriendConfirmed}
      />
    </div>
  );
};

const useStyles = makeStyles<Theme, { block: boolean }>({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '5rem',
  },
  button: props => ({
    '&&': {
      color: props.block ? 'red' : 'black',
      fontSize: '1.8rem'
    }
  }),
  blockText: props => ({
    color: props.block ? 'red' : 'black',
  }),
  clearIcon: {
    color: 'red',
    marginRight: '1rem'
  },
  checkIcon: {
    color: 'green',
    marginRight: '1rem'
  }
});

export default FriendshipButton;