import React, {useCallback, useState} from "react";
import {useTopBarStyles} from "./components/top-bar";
import {Avatar, makeStyles, Typography, useMediaQuery} from "@material-ui/core";
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

const MainScreen = () => {
  const [searching, setSearching] = useState(false);
  const history = useHistory();
  const state = useSelector((state: AppState) => state.me);
  const isMobile = useMediaQuery("(max-width: 650px)");
  const isLarge = useMediaQuery("(min-width: 1000px)");

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
            <Badges/>
          </div>
          <SearchTextField
            onFocus={beginSearch}
            onBack={endSearch}
          />
          {searching && <SearchScreen/>}
          {!searching && <ChatScreen/>}
        </div>
        {
          !isMobile &&
          <Route path="/c/:id">
            <div className={classes.rightSection}>
              <ConversationScreen/>
            </div>
          </Route>
        }
      </div>
    </div>
  );
};

type MainScreenStyle = {
  isMobile: boolean,
  isLarge: boolean,
}

const useStyles = makeStyles<Theme, MainScreenStyle>({
  wrapper: props => ({
    ...wrapper,
    flexDirection: 'column',
    paddingTop: props.isMobile ? "70px" : 0,
    height: "100%",
    overflowY: "hidden",
    overflowX: "hidden",
  }),
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
  horizontalWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  leftSection: props => ({
    width: props.isLarge ? "35%" : "40%",
    minWidth: "300px",
    borderRight: "0.1px solid rgba(0,0,0,0.1)"
  }),
  leftSectionTopBar: {
    display: "flex",
    padding: "8px 16px",
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    height: "100%",
  }
});

export default MainScreen;