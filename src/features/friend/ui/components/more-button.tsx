import React, {useCallback, useState} from "react";
import {Icon, IconButton, makeStyles, MenuItem} from "@material-ui/core";
import GenericMenu from "../../../../shared/components/generic-menu";
import AlertDialog from "../../../../shared/components/alert-dialog";
import {useAppDispatch, useAppSelector} from "../../../../core/redux/hooks";
import {useFriendProfileActions} from "../../friend-profile-actions-context";
import {FriendshipStatus} from "../../types/friendship";

const MoreButton = () => {
  const state = useAppSelector(state => state.friendProfile);
  const dispatch = useAppDispatch();
  const {block, unblock} = useFriendProfileActions();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [confirmingUnblock, setConfirmingUnblock] = useState(false);
  const classes = useStyles();

  const onMoreClicked = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const closeMoreMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const showBlockConfirmationDialog = useCallback(() => {
    setConfirmingBlock(true);
    setAnchorEl(null);
  }, []);

  const showUnblockConfirmationDialog = useCallback(() => {
    setConfirmingUnblock(true);
    setAnchorEl(null);
  }, []);

  const blockConfirmed = useCallback(() => {
    setConfirmingBlock(false);
    dispatch(block());
  }, []);

  const unblockConfirmed = useCallback(() => {
    setConfirmingUnblock(false);
    dispatch(unblock());
  }, []);

  const actionCanceled = useCallback(() => {
    setConfirmingBlock(false);
    setConfirmingUnblock(false);
  }, []);

  const status = state.friendship?.status;
  if (!status || status == FriendshipStatus.BLOCKED) {
    return <div data-testid='no-more'/>;
  }
  const blocking = status == FriendshipStatus.BLOCKING;
  return (
    <div className={classes.outer}>
      <IconButton
        onClick={onMoreClicked}
        className={classes.moreButton}
        data-testid='more-button'>
        <Icon>more_vert</Icon>
      </IconButton>
      <GenericMenu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMoreMenu}>
        {!blocking &&
        <MenuItem onClick={showBlockConfirmationDialog}
                  data-testid='block-button'>
          <Icon className={classes.menuIcon}>block</Icon> Block user
        </MenuItem>
        }
        {blocking &&
        <MenuItem onClick={showUnblockConfirmationDialog}
                  data-testid='unblock-button'>
          <Icon className={classes.menuIcon}>lock_open</Icon> Unblock user
        </MenuItem>
        }
      </GenericMenu>
      <AlertDialog
        title='Block the user'
        content="Are you sure you want to block this user?"
        open={confirmingBlock}
        onCancel={actionCanceled}
        onConfirm={blockConfirmed}/>
      <AlertDialog
        title='Unblock the user'
        content="Are you sure you want to unblock this user?"
        open={confirmingUnblock}
        onCancel={actionCanceled}
        onConfirm={unblockConfirmed}/>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    position: 'absolute',
    right: 0,
    color: 'black',
  },
  moreButton: {
    color: 'black'
  },
  menuIcon: {
    color: 'black',
    marginRight: '0.5rem',
  }
});

export default MoreButton;
