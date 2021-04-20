import React, {useCallback, useState} from "react";
import {useTopBarStyles} from "./components/top-bar";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import {Route, useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../core/redux/store";
import SearchTextField from "../../search/ui/components/search-text-field";
import SearchScreen from "../../search/ui/search-screen";
import Badges from "../../badge/ui/components/badges";
import ChatScreen from "../../chat/ui/chat-screen";
import ConversationScreen from "../../chat/ui/conversation-screen";
import {useLargeMQ, useMobileMQ} from "../../../shared/styles/media-query";
import ResponsiveTwoSides
  from "../../../shared/components/responsive-two-sides";

const MainScreen = () => {
  const [searching, setSearching] = useState(false);
  const history = useHistory();
  const state = useSelector((state: AppState) => state.me);
  const isMobile = useMobileMQ();
  const isLarge = useLargeMQ();

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
  const classes = useStyles({isMobile, isLarge});

  const leftTopBar = (
    <>
      <Avatar
        className={topBarClasses.leading + ' ' + classes.avatar}
        src={state.me.photo?.small}
        alt='profile photo'
        onClick={goToProfile}
      />
      <Typography variant="h6" className={topBarClasses.title}>
        Chats
      </Typography>
      <div className={classes.spacer}/>
      <Badges/>
    </>
  );
  const leftChildren = (
    <>
      <SearchTextField
        onFocus={beginSearch}
        onBack={endSearch}
      />
      {searching && <SearchScreen/>}
      {!searching && <ChatScreen/>}
    </>
  );
  const rightChildren = (
    <Route path="/c/:id">
      <ConversationScreen/>
    </Route>
  );
  const rightFiller = "Click on a conversation to start chatting";
  return (
    <ResponsiveTwoSides
      leftTopBar={leftTopBar}
      leftChildren={leftChildren}
      rightChildren={rightChildren}
      rightFiller={rightFiller}
    />
  );
};

const useStyles = makeStyles({
  avatar: {
    cursor: 'pointer'
  },
  spacer: {
    flex: 1,
  }
});

export default MainScreen;