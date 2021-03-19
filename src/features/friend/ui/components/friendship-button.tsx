import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../store/hooks";
import {
  Icon,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  MenuProps
} from "@material-ui/core";
import {FriendshipStatus} from "../../types/friendship";
import {PulseLoader} from "react-spinners";
import {useFriendActions} from "../../friend-profile-actions-context";

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

  const classes = useStyles();

  const onClose = () => {
    setAnchorEl1(null);
    setAnchorEl2(null);
  };

  const sendFR = () => {
    dispatch(actions.sendFriendRequest());
  };

  const cancelFR = () => {
    dispatch(actions.cancelFriendRequest());
    setAnchorEl2(null);
  };

  const acceptFR = () => {
    dispatch(actions.acceptFriendRequest());
    setAnchorEl1(null);
  };

  const declineFR = () => {
    dispatch(actions.declineFriendRequest());
    setAnchorEl1(null);
  };

  const removeFriend = () => {
    dispatch(actions.unfriend());
  };

  const onRequestSentTapped = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(e.currentTarget);
  };

  const onRequestReceivedTapped = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl1(e.currentTarget);
  };

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
        onTap = removeFriend;
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
    <div className={classes.wrapper}>
      {child}
      <FMenu
        anchorEl={anchorEl1}
        open={Boolean(anchorEl1)}
        onClose={onClose}
        keepMounted
      >
        <MenuItem onClick={acceptFR}>
          <Icon className={classes.checkIcon}>check</Icon>
          Accept
        </MenuItem>
        <MenuItem onClick={declineFR}>
          <Icon className={classes.clearIcon}>clear</Icon>
          Decline
        </MenuItem>
      </FMenu>
      <FMenu
        anchorEl={anchorEl2}
        open={Boolean(anchorEl2)}
        onClose={onClose}
        keepMounted
      >
        <MenuItem onClick={cancelFR}>
          <Icon className={classes.clearIcon}>clear</Icon>
          Cancel
        </MenuItem>
      </FMenu>
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