import React, {useCallback, useState} from "react";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../store/store";
import {wrapper} from "../../../styles/shared";
import SearchTextField from "../../search/ui/components/search-text-field";
import SearchScreen from "../../search/ui/search-screen";
import Badges from "../../badge/ui/components/badges";
import ChatScreen from "../../chat/ui/chat-screen";

const MainScreen = () => {
  const [searching, setSearching] = useState(false);
  const history = useHistory();
  const state = useSelector((state: AppState) => state.me);

  if (!state.me)
    return <div/>;

  const goToProfile = useCallback(() => {
    history.push('/profile');
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
          src={state.me.photo?.small}
          alt='profile photo'
          onClick={goToProfile}
        />
        <Typography variant="h6" className={topBarClasses.title}>
          Chats
        </Typography>
        <Badges/>
      </TopBar>
      <SearchTextField
        onFocus={beginSearch}
        onBack={endSearch}
      />
      {searching && <SearchScreen/>}
      {!searching && <ChatScreen/>}
    </div>
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
});

export default MainScreen;
