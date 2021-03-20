import React, {useCallback, useState} from "react";
import {Icon, makeStyles,} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import CircleButton from "./circle-button";
import MenuDialog from "./menu-dialog";
import AlertDialog from "../../../../components/alert-dialog";
import {nonDraggable} from "../../../../styles/shared";
import {useDropzone} from "react-dropzone";


type ProfilePhotoPickerStyle = {
  size?: number,
}

type ProfilePhotoPickerProps = {
  defaultSrc: string,
  src?: string,
  onPhotoPicked: (photo: File) => void,
  onPhotoRemoved: () => void,
} & ProfilePhotoPickerStyle;

const ProfilePhotoPicker = (props: ProfilePhotoPickerProps) => {
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      props.onPhotoPicked(files[0]);
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    accept: 'image/jpeg,image/png',
    noClick: true,
    noKeyboard: true,
  });

  const pickPhoto = useCallback(() => {
    setMenuOpen(false);
    open();
  }, []);

  const confirmRemoval = useCallback(() => {
    setMenuOpen(false);
    setConfirming(true);
  }, []);

  const removalCanceled = useCallback(() => {
    setConfirming(false);
  }, []);

  const removalConfirmed = useCallback(() => {
    setConfirming(false);
    props.onPhotoRemoved();
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const classes = useStyles({...props, isDragActive});

  const menuItems = [
    {icon: 'edit', label: 'New profile photo', onClick: pickPhoto},
  ];
  if (props.src) {
    menuItems.push(
      {icon: 'clear', label: 'Remove current photo', onClick: confirmRemoval}
    );
  }

  const rootProps = getRootProps({
    className: classes.dragIndicator,
  });

  const inputProps = getInputProps({
    type: 'file',
    accept: 'image/jpeg,image/x-png',
    hidden: true,
  });

  return (
    <div
      className={classes.wrapper}
      data-testid='profile-photo-picker'
    >
      <div {...rootProps} data-testid='profile-photo-drop-zone'>
        <Icon className={classes.dragIcon}>camera_alt</Icon>
      </div>
      <img className={classes.photo} src={props.src ?? props.defaultSrc}
           alt='profile photo'/>
      <div className={classes.buttonWrapper}>
        <CircleButton
          onClick={openMenu}
          size={props.size ? props.size * 0.2 : undefined}
          icon='edit'
          bgColor='#212121'
          iconColor='#ffffff'
          data-testid='edit-profile-photo'
        />
      </div>
      <input {...inputProps} data-testid='profile-photo-input'/>
      <AlertDialog
        title='Remove photo?'
        content={"You're about to remove the selected photo"}
        open={confirming}
        onCancel={removalCanceled}
        onConfirm={removalConfirmed}
      />
      <MenuDialog
        visible={menuOpen}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
};

const useStyles = makeStyles<Theme, ProfilePhotoPickerStyle & { isDragActive: boolean }>(_ => {
  const _defaultSize = 150;
  return ({
    wrapper: props => {
      const size = `${props.size ?? _defaultSize}px`;
      return {
        position: 'relative',
        width: size,
        height: size,
        outline: 'none',
      };
    },
    photo: props => {
      const size = `${props.size ?? _defaultSize}px`;
      return {
        borderRadius: '50%',
        border: '1px solid black',
        width: size,
        height: size,
        outline: 'none',
        ...nonDraggable,
      };
    },
    dragIndicator: props => {
      const size = `${props.size ?? _defaultSize}px`;
      const opacity = props.isDragActive ? 1 : 0;
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        borderRadius: '50%',
        width: size,
        height: size,
        background: 'rgb(0, 0, 0, 0.5)',
        opacity: opacity,
        transition: '200ms ease',
      };
    },
    dragIcon: props => {
      const size = `${(props.size ?? _defaultSize) / 3}px`;
      return {
        '&&': {
          fontSize: size,
          color: 'white',
        },
      };
    },
    buttonWrapper: {
      position: 'absolute',
      bottom: '5%',
      right: '5%',
    },
  });
});

export default ProfilePhotoPicker;
