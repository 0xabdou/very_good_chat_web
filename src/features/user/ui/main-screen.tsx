import React, {useCallback, useContext, useState} from "react";
import TopBar, {useTopBarStyles} from "./components/top-bar";
import {Avatar, Icon, IconButton, Typography} from "@material-ui/core";
import MenuDialog, {MenuDialogItemProps} from "./components/menu-dialog";
import {useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../../../store/store";
import {AuthActionsContext} from "../../auth/auth-actions-context";
import {UserActionsContext} from "../user-actions-context";
import {useAppDispatch} from "../../../store/hooks";

const MainScreen = () => {
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

  const menuItems: MenuDialogItemProps[] = [
    {icon: 'person', label: 'profile', onClick: goToProfile},
    {icon: 'logout', label: 'sign out', onClick: logout},
  ];

  const classes = useTopBarStyles();

  return (
    <div className={classes.wrapper} data-testid='main-screen'>
      <TopBar>
        <Avatar
          className={classes.leading}
          src={state.currentUser.photoURL ?? undefined}
          alt='profile photo'
        />
        <Typography variant="h6" className={classes.title}>
          Chats
        </Typography>
        <IconButton
          className={classes.actionButton}
          onClick={() => setMenuOpen(true)}>
          <Icon>more_horiz</Icon>
        </IconButton>
        <IconButton className={classes.actionButton}>
          <Icon>create</Icon>
        </IconButton>
        <MenuDialog
          visible={menuOpen}
          items={menuItems}
          onClose={() => setMenuOpen(false)}
        />
      </TopBar>
    </div>
  );
};

export default MainScreen;