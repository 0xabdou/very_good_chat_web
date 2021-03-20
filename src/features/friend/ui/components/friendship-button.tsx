import React, {useCallback, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../store/hooks";
import {
  Icon,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  MenuProps
} from "@material-ui/core";
import {Friendship, FriendshipStatus} from "../../types/friendship";
import {PulseLoader} from "react-spinners";
import {useFriendActions} from "../../friend-profile-actions-context";
import FriendError from "../../types/friend-error";
import AlertDialog from "../../../../components/alert-dialog";

const FMenu = (props: MenuProps) => {
  return (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  );
};

const FriendshipButton = () => {
  const state = useAppSelector(state => state.friendProfile);
  const dispatch = useAppDispatch();
  const actions = useFriendActions();
  const [anchorEl1, setAnchorEl1] = useState<HTMLElement | null>(null);
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const [anchorEl3, setAnchorEl3] = useState<HTMLElement | null>(null);
  const [alerting, setAlerting] = useState(false);

  const classes = useStyles();

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
    console.log(result);
    if (result.meta.requestStatus == 'rejected') {
      dispatch(actions.getFriendshipInfo(state.user!.username));
    }
  };

  const sendFR = useCallback(() => {
    void handleError(dispatch(actions.sendFriendRequest()));
  }, []);

  const cancelFR = useCallback(() => {
    setAnchorEl2(null);
    void handleError(dispatch(actions.cancelFriendRequest()));
  }, []);

  const acceptFR = useCallback(() => {
    setAnchorEl1(null);
    void handleError(dispatch(actions.acceptFriendRequest()));
  }, []);

  const declineFR = useCallback(() => {
    setAnchorEl1(null);
    void handleError(dispatch(actions.declineFriendRequest()));
  }, []);

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
  }, []);

  let child: React.ReactElement;
  if (state.loading || !state.friendship) {
    child = <PulseLoader/>;
  } else {
    let icon: string | undefined;
    let label: string | undefined;
    let onTap: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
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
    }
    if (icon) {
      child = (
        <>
          <IconButton
            className={classes.button}
            aria-controls="customized-menu"
            aria-haspopup="true"
            onClick={onTap}
            disabled={state.modifyingFriendship}
            data-testid={icon}
          >
            <i className={icon}/>
          </IconButton>
          {label}
        </>
      );
    } else {
      if (state.friendship.status == FriendshipStatus.BLOCKED)
        child = <span>You blocked this user</span>;
      else
        child = <span>This user has blocked you</span>;
    }
  }
  return (
    <div className={classes.wrapper} data-testid='friendship-button'>
      {child}
      <FMenu
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
      </FMenu>
      <FMenu
        anchorEl={anchorEl2}
        open={Boolean(anchorEl2)}
        onClose={onClose}
      >
        <MenuItem onClick={cancelFR} data-testid='cancel request'>
          <Icon className={classes.clearIcon}>clear</Icon>
          Cancel
        </MenuItem>
      </FMenu>
      <FMenu
        anchorEl={anchorEl3}
        open={Boolean(anchorEl3)}
        onClose={onClose}
      >
        <MenuItem onClick={onUnfriendTapped} data-testid='unfriend'>
          <Icon className={classes.clearIcon}>clear</Icon>
          Remove friend
        </MenuItem>
      </FMenu>
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

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '5rem',
  },
  button: {
    color: 'black',
    fontSize: '1.8rem'
  },
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