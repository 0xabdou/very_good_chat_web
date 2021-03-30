import React, {ChangeEvent, useCallback, useState} from "react";
import ProfilePhotoPicker from "./components/profile-photo-picker";
import PhotoCropper from "./components/photo-cropper";
import {
  Button,
  CircularProgress,
  createStyles,
  Icon,
  IconButton,
  makeStyles,
  TextField
} from "@material-ui/core";
import FullScreenDialog from "./components/fullscreen-dialog";
import AlertDialog from "../../../components/alert-dialog";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import UserError from "../types/user-error";
import {centeredLayout, nonSelectable, wrapper} from "../../../styles/shared";
import {ErrorSnackbar, SuccessSnackbar} from "../../../components/snackbars";
import {useAuthActions} from "../../auth/auth-actions-context";
import {useUserActions} from "../user-actions-context";
import {usePhotoUtils} from "../../../utils/photo-utils";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {UserUpdate} from "../types/user";

const validators = {
  validateUsername(username: string) {
    if (username.length == 0) return 'A username is required';
    if (username[0] == '.' || username[username.length - 1] == '.')
      return "The username can't start or end with a dot";
    if (/\.{2,}/.test(username)) return "The username can't have 2 consecutive dots";
    if (username.length < 4) return 'Username must be 4 characters at least';
    if (username.length > 20) return 'Username must be 20 characters at most';
    if (!/^[a-z0-9._]+$/.test(username)) return 'Username can only contain letter, numbers, . and _';
  },
  validateName(name: string) {
    if (name.length > 20) return 'Name must be 20 characters at most';
  }
};

export type ProfileUpdatingScreenProps = {
  registering?: boolean,
  initialUsername?: string,
  initialName?: string,
  initialPhotoURL?: string,
}

const ProfileUpdatingScreen = (props: ProfileUpdatingScreenProps) => {
  const defaultSrc = '/images/default-pp.png';

  // Local state
  // Current chosen profile photo
  const [src, setSrc] = useState(props.initialPhotoURL);
  // Photo being cropped
  const [cropSrc, setCropSrc] = useState<string>();
  // Set this to true to open the photo cropper fullscreen dialog
  const [cropping, setCropping] = useState(false);
  // Chosen username
  const [username, setUsername] = useState(props.initialUsername ?? '');
  // Chosen username error (could be invalid or taken)
  const [usernameError, setUsernameError] = useState<string>();
  // Chosen name
  const [name, setName] = useState(props.initialName ?? '');
  // Chosen name error
  const [nameError, setNameError] = useState<string>();
  // Set to true to show the logout alert dialog
  const [loggingOut, setLoggingOut] = useState(false);
  const [success, setSuccess] = useState(0);

  // Redux hooks
  const state = useAppSelector(state => state.me);
  const dispatch = useAppDispatch();
  const {signOut} = useAuthActions();
  const {createMe, updateMe, reset} = useUserActions();

  // photo utils
  const photoUtils = usePhotoUtils();

  const stringifyError = useCallback((e: UserError | null) => {
    switch (e) {
      case UserError.network:
        return 'Check your internet connection';
      default:
        return 'Something weird happened';
    }
  }, []);

  // Return true if there is a username error (used in the username textField)
  const hasUsernameError = () => {
    return usernameError != undefined || state.error == UserError.usernameTaken;
  };

  // Return the string representation of the error displayed in the username TextField
  const getUsernameError = () => {
    if (usernameError) return usernameError;
    if (state.error == UserError.usernameTaken)
      return 'This username is taken';
  };

  // Called by the ProfilePhotoPicker component when the user selects a photo
  const photoPicked = useCallback(async (photo: File) => {
    const newCropSrc = await photoUtils.photoToURL(photo);
    cropPhoto(newCropSrc);
  }, []);

  // Called by the ProfilePhotoPicker component when the user removes the selected photo
  const photoRemoved = useCallback(() => {
    setSrc(undefined);
  }, []);

  // Call this to show the photo cropper with photo passed as a parameter
  const cropPhoto = (newCropSrc: string) => {
    setCropSrc(undefined);
    setCropSrc(newCropSrc);
    setCropping(true);
  };

  // Called by the photo cropper when the crop is canceled
  const cancelCropping = useCallback(() => {
    setCropping(false);
  }, []);

  // Called by the photo cropper with the cropped photo
  const photoCropped = useCallback((photo: string | null) => {
    setCropping(false);
    if (photo)
      setSrc(photo);
  }, []);

  // onChange for the username TextField
  const usernameChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase();
    setUsername(username);
  }, []);

  // onChange for the name TextField
  const nameChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setName(name);
  }, []);

  // Show alert dialog when the user clicks the logout button
  const askForLogoutConfirmation = useCallback(() => {
    setLoggingOut(true);
  }, []);

  // Called when the user confirms the logout from the alert dialog
  const logoutConfirmed = useCallback(() => {
    setLoggingOut(false);
    dispatch(signOut());
    dispatch(reset());
  }, []);

  // Called when the user cancels the logout from the alert dialog
  const logoutCanceled = useCallback(() => {
    setLoggingOut(false);
  }, []);

  // Called when the registration form is submitted
  const submit = useCallback(async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    const usernameError = validators.validateUsername(username);
    setUsernameError(usernameError);
    const nameError = validators.validateName(name);
    setNameError(nameError);
    // Don't submit if there is a validation error
    if (usernameError || nameError) return;


    if (props.registering) {
      let photo: File | undefined;
      if (src) {
        photo = await photoUtils.urlToPhoto(src);
      }
      dispatch(createMe({
        username,
        name,
        photo,
      }));
    } else {
      const update: UserUpdate = {};
      if (username != props.initialUsername) update.username = username;
      if (name != props.initialName) {
        if (name.length) update.name = name;
        else if (props.initialName) update.deleteName = true;
      }
      if (src != props.initialPhotoURL) {
        if (src) {
          update.photo = await photoUtils.urlToPhoto(src);
        } else {
          update.deletePhoto = true;
        }
      }
      if (!Object.keys(update).length) return;
      const result = await dispatch(updateMe(update));
      if (result.meta.requestStatus == 'fulfilled') {
        setSuccess(s => s + 1);
      }
    }
  }, [username, name, src]);

  const classes = useStyles();

  return (
    <div className={classes.wrapper} data-testid='profile-updating-screen'>
      {props.registering && <IconButton
        className={classes.logoutButton}
        onClick={askForLogoutConfirmation}
        data-testid='logout-button'
      >
        <Icon>logout</Icon>
      </IconButton>}
      <div className={classes.layout}>
        <ProfilePhotoPicker
          defaultSrc={defaultSrc}
          src={src}
          onPhotoPicked={photoPicked}
          onPhotoRemoved={photoRemoved}
        />
        <form className={classes.form}>
          <TextField
            className={classes.textField}
            onChange={usernameChanged}
            value={username}
            variant='outlined'
            label='username'
            helperText={getUsernameError()}
            error={hasUsernameError()}
            data-testid='username-text-field'
          />
          <TextField
            className={classes.textField}
            onChange={nameChanged}
            value={name}
            variant='outlined'
            label='name'
            helperText={nameError}
            error={!!nameError}
            data-testid='name-text-field'
          />
          <div className={classes.saveWrapper}>
            {!state.updatingUser &&
            <Button
              startIcon={<Icon>check</Icon>}
              onClick={submit}
              type='submit'
              variant='contained'
              color='primary'
              data-testid='submit-button'>
              save
            </Button>}
            {state.updatingUser &&
            <CircularProgress data-testid='registration-loading'/>}
          </div>
        </form>
        <FullScreenDialog visible={cropping} onClose={cancelCropping}>
          <PhotoCropper
            src={cropSrc || defaultSrc}
            onCropFinished={photoCropped}
            onCropCanceled={cancelCropping}
          />
        </FullScreenDialog>
        <AlertDialog
          title='Logout'
          content='Are you sure you want to logout?'
          open={loggingOut}
          onCancel={logoutCanceled}
          onConfirm={logoutConfirmed}
          data-testid='logout-confirmation'
        />
        <ErrorSnackbar
          currentError={state.error}
          stringify={stringifyError}
          exclude={[UserError.usernameTaken]}
        />
        <SuccessSnackbar
          renderCount={success}
          message='Profile updated successfully'/>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    ...wrapper,
    ...nonSelectable,
  },
  layout: centeredLayout,
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    margin: '10px auto',
    width: '250px',
  },
  saveWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50px',
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: theme.spacing(2),
    color: 'black',
  }
}));

export default ProfileUpdatingScreen;
