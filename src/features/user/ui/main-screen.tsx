import React, {useCallback, useState} from "react";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {
  Avatar,
  Badge,
  Icon,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../store/store";
import {wrapper} from "../../../styles/shared";
import SearchTextField from "../../search/ui/components/search-text-field";
import SearchScreen from "../../search/ui/search-screen";
import SearchActionsProvider from "../../search/search-actions-context";

const MainScreen = () => {
  const [searching, setSearching] = useState(false);
  const history = useHistory();
  const state = useSelector((state: AppState) => state.user);

  if (!state.currentUser)
    return <div/>;

  const goToProfile = useCallback(() => {
    history.push('/profile');
  }, [history]);

  const goToRequests = useCallback(() => {
    history.push('/requests');
  }, [history]);

  const beginSearch = useCallback(() => {
    setSearching(true);
  }, []);

  const endSearch = useCallback(() => {
    setSearching(false);
  }, []);

  const topBarClasses = useTopBarStyles();
  const classes = useStyles();

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <TopBar>
        <Avatar
          className={topBarClasses.leading + ' ' + classes.avatar}
          src={state.currentUser.photo?.small}
          alt='profile photo'
          onClick={goToProfile}
        />
        <Typography variant="h6" className={topBarClasses.title}>
          Chats
        </Typography>
        <IconButton className={topBarClasses.actionButton}
                    onClick={goToRequests}>
          <Badge badgeContent={0} className={classes.badge}>
            <Icon>people</Icon>
          </Badge>
        </IconButton>
        <IconButton className={topBarClasses.actionButton}>
          <Badge badgeContent={2} className={classes.badge}>
            <Icon>notifications</Icon>
          </Badge>
        </IconButton>
      </TopBar>
      <SearchTextField
        onFocus={beginSearch}
        onBack={endSearch}
      />
      {searching && <SearchScreen/>}
      {!searching && <ChatsScreen/>}
    </div>
  );
};

const ChatsScreen = () => {
  const classes = useStyles();
  return (
    <SearchActionsProvider>
      <div className={classes.full}>Chatting</div>
    </SearchActionsProvider>
  );
};

const useStyles = makeStyles({
  wrapper: {
    ...wrapper,
    flexDirection: 'column',
    paddingTop: '70px',
  },
  spacer: {
    height: '12%',
  },
  full: {
    marginTop: '1rem',
    background: 'red',
    flexGrow: 1,
    overflowY: 'auto',
  },
  inner: {
    background: 'blue',
    height: '1000px',
  },
  avatar: {
    cursor: 'pointer'
  },
  badge: {
    '& .MuiBadge-badge': {
      background: 'red',
      color: 'white',
    }
  }
});

export default MainScreen;
