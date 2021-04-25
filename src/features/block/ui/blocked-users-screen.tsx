import React, {useCallback, useEffect} from "react";
import {makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import RetryPage from "../../../shared/components/retry-page";
import useBlockActions from "../block-actions-context";
import {stringifyBlockError} from "../types/block-error";
import {Block} from "../types/block";
import BlockedListItem from "./components/blocked-list-item";
import {useHistory} from "react-router-dom";
import BackButton from "../../../shared/components/back-button";

const BlockedUsersScreen = () => {
  const state = useAppSelector(state => state.block);
  const dispatch = useAppDispatch();
  const actions = useBlockActions();
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    dispatch(actions.getBlockedUsers());
  }, []);

  const retry = useCallback(() => {
    dispatch(actions.getBlockedUsers());
  }, []);

  const onItemClicked = useCallback((block: Block) => {
    history.push(`/u/${block.user.username}`, {canGoBack: true});
  }, [history]);

  let child: React.ReactNode;
  if (!state.error && !state.blocks) {
    child = <FullscreenLoader/>;
  } else if (state.blocks) {
    if (state.blocks.length) {
      child = (
        <div className={classes.blocked}>
          {
            state.blocks.map(block => {
              return <BlockedListItem
                block={block}
                onClick={onItemClicked}
                key={block.user.id}
              />;
            })
          }
        </div>
      );
    } else {
      child = (
        <span className={classes.centered} data-testid='no-blocked-users'>
          You haven't blocked anyone
        </span>
      );
    }
  } else {
    child = (
      <RetryPage
        onRetry={retry}
        errorMessage={stringifyBlockError(state.error)}
      />
    );
  }

  return (
    <div className={classes.outer} data-testid='blocked-users-screen'>
      <TopBar>
        <BackButton/>
        <Typography variant='h6' className={topBarClasses.title}>
          Blocked users
        </Typography>
      </TopBar>
      {child}
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
  blocked: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: "auto",
  },
  centered: {
    margin: 'auto',
  }
});

export default BlockedUsersScreen;