import React, {useCallback, useEffect} from "react";
import {makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import RetryPage from "../../../shared/components/retry-page";
import useBlockActions from "../block-actions-context";
import {stringifyBlockError} from "../types/block-error";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import {Block} from "../types/block";
import BlockedListItem from "./components/blocked-list-item";
import {useHistory} from "react-router-dom";

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

  const itemKey = useCallback((index: number, data: Block[]) => {
    return data[index].user.username;
  }, []);

  const retry = useCallback(() => {
    dispatch(actions.getBlockedUsers());
  }, []);

  const onItemClicked = useCallback((block: Block) => {
    history.push(`/u/${block.user.username}`);
  }, [history]);

  let child: React.ReactNode;
  if (!state.error && !state.blocks) {
    child = <FullscreenLoader/>;
  } else if (state.blocks) {
    if (state.blocks.length) {
      child = (
        <AutoSizer>
          {({height, width}) => {
            const blocks = state.blocks!;
            return <FixedSizeList
              itemCount={blocks.length}
              itemData={blocks}
              itemKey={itemKey}
              height={height}
              width={width}
              itemSize={72}
            >
              {({index, style, data}) => {
                return (
                  <BlockedListItem
                    style={style}
                    block={data[index]}
                    onClick={onItemClicked}
                  />
                );
              }}
            </FixedSizeList>;
          }}
        </AutoSizer>
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
  centered: {
    margin: 'auto',
  }
});

export default BlockedUsersScreen;