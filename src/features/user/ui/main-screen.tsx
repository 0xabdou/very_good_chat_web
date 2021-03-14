import React, {useCallback, useContext, useState} from "react";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {
  Avatar,
  Icon,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import MenuDialog, {MenuDialogItemProps} from "./components/menu-dialog";
import {useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../store/store";
import {AuthActionsContext} from "../../auth/auth-actions-context";
import {UserActionsContext} from "../user-actions-context";
import {useAppDispatch} from "../../../store/hooks";
import {wrapper} from "../../../styles/shared";
import SearchTextField from "../../search/ui/components/search-text-field";
import SearchScreen from "../../search/ui/search-screen";
import SearchActionsProvider from "../../search/search-actions-context";

const MainScreen = () => {
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const history = useHistory();
  const state = useSelector((state: AppState) => state.user);
  const {signOut} = useContext(AuthActionsContext);
  const {resetUser} = useContext(UserActionsContext);
  const dispatch = useAppDispatch();

  if (!state.currentUser)
    return <div/>;

  const goToProfile = useCallback(() => {
    setMenuOpen(false);
    history.push('/profile');
  }, [menuOpen, history]);

  const logout = async () => {
    setMenuOpen(false);
    await dispatch(signOut());
    // TODO: check if signOut succeeded, then resetUser
    dispatch(resetUser());
  };

  const beginSearch = useCallback(() => {
    setSearching(true);
  }, []);

  const endSearch = useCallback(() => {
    setSearching(false);
  }, []);

  const menuItems: MenuDialogItemProps[] = [
    {icon: 'person', label: 'profile', onClick: goToProfile},
    {icon: 'logout', label: 'sign out', onClick: logout},
  ];

  const topBarClasses = useTopBarStyles();
  const classes = useStyles();

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <TopBar>
        <Avatar
          className={topBarClasses.leading}
          src={state.currentUser.photoURL ?? undefined}
          alt='profile photo'
        />
        <Typography variant="h6" className={topBarClasses.title}>
          Chats
        </Typography>
        <IconButton
          className={topBarClasses.actionButton}
          onClick={() => setMenuOpen(true)}>
          <Icon>more_horiz</Icon>
        </IconButton>
        <IconButton className={topBarClasses.actionButton}>
          <Icon>create</Icon>
        </IconButton>
        <MenuDialog
          visible={menuOpen}
          items={menuItems}
          onClose={() => setMenuOpen(false)}
        />
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
  }
});

export default MainScreen;
