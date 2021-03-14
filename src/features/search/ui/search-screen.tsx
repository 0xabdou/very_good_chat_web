import React, {useCallback} from "react";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {useAppSelector} from "../../../store/hooks";
import {PulseLoader} from "react-spinners";
import {FixedSizeList} from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import User from "../../user/types/user";
import {SearchError} from "../types/search-error";

const SearchScreen = () => {
  const state = useAppSelector(state => state.search);
  const classes = useStyles();

  const itemKey = useCallback((index: number) => {
    if (state.results)
      return state.results[index].username;
    return index;
  }, [state.results]);

  const onItemClicked = useCallback((user: User) => {
    // TODO: go to user profile
    console.log(user);
  }, []);

  let child: React.ReactNode;
  if (state.error != null) {
    child =
      <div className={classes.centered} data-testid='search-error'>
        {state.error == SearchError.network
          ? 'Check your internet'
          : 'Something weird happened!'}
      </div>;
  } else if (state.loading) {
    child =
      <div className={classes.centered} data-testid='search-loading'>
        <PulseLoader/>
      </div>;
  } else if (state.results) {
    if (state.results.length) {
      child = (
        <AutoSizer >
          {({height, width}) => {
            return <FixedSizeList
              itemCount={state.results!.length}
              itemKey={itemKey}
              height={height}
              width={width}
              itemSize={56}
            >
              {({index, style}) => {
                return (
                  <UserListItem
                    style={style}
                    user={state.results![index]}
                    onClick={onItemClicked}
                  />
                );
              }}
            </FixedSizeList>;
          }}
        </AutoSizer>);
    } else {
      child =
        <div className={classes.centered} data-testid='search-no-results'>
          No results
        </div>;
    }
  }
  return (
    <div className={classes.full} data-testid='search-screen'>
      {child}
    </div>
  );
};


type UserListItemProps = {
  user: User,
  onClick: (user: User) => void,
  style?: React.CSSProperties,
}
const UserListItem = ({user, style, onClick}: UserListItemProps) => {
  let primary: string;
  let secondary: string | undefined;
  if (user.name) {
    primary = user.name;
    secondary = user.username;
  } else {
    primary = user.username;
  }

  const onTap = useCallback(() => {
    onClick(user);
  }, []);

  return (
    <ListItem
      style={style}
      key={user.username}
      button
      onClick={onTap}
      data-testid='search-result-item'>
      <ListItemAvatar>
        <Avatar src={user.photoURL ?? undefined}/>
      </ListItemAvatar>
      <ListItemText primary={primary} secondary={secondary}/>
    </ListItem>
  );
};

const useStyles = makeStyles({
  full: {
    display: 'flex',
    marginTop: '1rem',
    flexGrow: 1,
  },
  centered: {
    margin: 'auto',
  },
  results: {
    width: '100%',
  }
});

export default SearchScreen;
