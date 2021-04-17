import React, {useCallback, useState} from "react";
import {useTopBarStyles} from "./components/top-bar";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import {Route, useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../core/redux/store";
import {wrapper} from "../../../shared/styles/shared";
import SearchTextField from "../../search/ui/components/search-text-field";
import SearchScreen from "../../search/ui/search-screen";
import Badges from "../../badge/ui/components/badges";
import ChatScreen from "../../chat/ui/chat-screen";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import ConversationScreen from "../../chat/ui/conversation-screen";
import {useLargeMQ, useMobileMQ} from "../../../shared/styles/media-query";

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

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <div className={classes.horizontalWrapper}>
        <div className={classes.leftSection}>
          <div className={classes.leftSectionTopBar}>
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
          </div>
          <SearchTextField
            onFocus={beginSearch}
            onBack={endSearch}
          />
          {searching && <SearchScreen/>}
          {!searching && <ChatScreen/>}
        </div>
        <div className={classes.rightSection}>
          <Route path="/c/:id">
            <ConversationScreen/>
          </Route>
          <span className={classes.filler}>
            Click on a conversation to start chatting
          </span>
        </div>
      </div>
    </div>
  );
};

type MainScreenStyle = {
  isMobile: boolean,
  isLarge: boolean,
}

const useStyles = makeStyles<Theme, MainScreenStyle>({
  wrapper: {
    ...wrapper,
    flexDirection: 'column',
    height: "100%",
    overflowY: "hidden",
    overflowX: "hidden",
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
  horizontalWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  leftSection: props => ({
    position: "relative",
    width: props.isMobile
      ? "100%"
      : props.isLarge ? "35%" : "40%",
    minWidth: "300px",
    borderRight: "0.1px solid rgba(0,0,0,0.1)",
    paddingTop: "70px",
  }),
  leftSectionTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    display: "flex",
    padding: "8px 16px",
    alignItems: "center",
    width: "100%",
  },
  rightSection: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  spacer: {
    flex: 1,
  },
  filler: props => ({
    display: props.isMobile ? "none" : undefined,
    position: "absolute",
    color: "black",
    zIndex: -1,
  })
});

export default MainScreen;