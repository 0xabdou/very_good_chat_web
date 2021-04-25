import React, {useCallback} from "react";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {useAppSelector} from "../../../core/redux/hooks";
import {PulseLoader} from "react-spinners";
import User from "../../user/types/user";
import {SearchError} from "../types/search-error";
import {useHistory} from "react-router-dom";

const SearchScreen = () => {
  const state = useAppSelector(state => state.search);
  const history = useHistory();
  const classes = useStyles();

  const onItemClicked = useCallback((user: User) => {
    history.push(`/u/${user.username}`, {canGoBack: true});
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
      child = state.results.map(user => {
        return <UserListItem
          user={user}
          onClick={onItemClicked}
          key={user.id}
        />;
      });
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
        <Avatar src={user.photo?.small}/>
      </ListItemAvatar>
      <ListItemText primary={primary} secondary={secondary}/>
    </ListItem>
  );
};

const useStyles = makeStyles({
  full: {
    display: 'flex',
    flexDirection: "column",
    marginTop: '1rem',
    height: "100%",
    overflowY: "auto"
  },
  centered: {
    margin: 'auto',
  },
  results: {
    width: '100%',
  }
});

export default SearchScreen;
