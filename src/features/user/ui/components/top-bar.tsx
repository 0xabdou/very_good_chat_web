import React, {useContext, useState} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../../../../store/store";
import {
  AppBar,
  Avatar,
  createStyles,
  Icon,
  IconButton,
  makeStyles,
  Toolbar,
  Typography
} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import MenuDialog, {MenuDialogItemProps} from "./menu-dialog";
import {AuthActionsContext} from "../../../auth/auth-actions-context";
import {UserActionsContext} from "../../user-actions-context";
import {useAppDispatch} from "../../../../store/hooks";


const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const state = useSelector((state: AppState) => state.user);
  const {signOut} = useContext(AuthActionsContext);
  const {resetUser} = useContext(UserActionsContext);
  const dispatch = useAppDispatch();

  if (!state.currentUser)
    return <div/>;

  const classes = useStyles();

  const goToProfile = () => {
    setMenuOpen(false);
    console.log('Profile clicked');
  };

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

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar className={classes.bar}>
        <Avatar
          className={classes.avatar}
          src={state.currentUser.photoURL ?? undefined}
          alt='profile photo'
        />
        <Typography variant="h6" className={classes.title}>
          Chats
        </Typography>
        <IconButton className={classes.button}
                    onClick={() => setMenuOpen(true)}>
          <Icon>more_horiz</Icon>
        </IconButton>
        <IconButton className={classes.button}><Icon>create</Icon></IconButton>
      </Toolbar>
      <MenuDialog
        visible={menuOpen}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </AppBar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bar: {
      background: 'white',
    },
    avatar: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      color: 'black',
    },
    button: {
      color: 'black',
    }
  }),
);

export default TopBar;
