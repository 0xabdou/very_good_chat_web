import Cropper from "react-easy-crop";
import {Area, Point} from "react-easy-crop/types";
import React, {useCallback, useContext, useEffect, useState} from "react";
import CircleButton, {CircleButtonProps} from "./circle-button";
import {makeStyles} from "@material-ui/core";
import {FileUtilsContext} from "../../../../shared/utils/file-utils";

type PhotoCropperProps = {
  src: string,
  onCropFinished: (cropped: string) => void,
  onCropCanceled: () => void,
};

const PhotoCropper = (props: PhotoCropperProps) => {
  const [crop, setCrop] = useState<Point>({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area>();
  const photoUtils = useContext(FileUtilsContext);

  useEffect(() => {
    const setInitialCrop = async () => {
      const dims = await photoUtils.getPhotoDimensions(props.src);
      let size = dims.height;
      if (size > dims.width) size = dims.width;
      const y = (dims.height - size) / 2;
      setArea({x: 0, y, height: size, width: size});
    };
    setInitialCrop().then();
  }, []);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  const save = useCallback(async () => {
    if (area) {
      const cropped = await photoUtils.cropPhoto(props.src, area);
      props.onCropFinished(cropped);
    }
  }, [area]);

  const cancel = useCallback(() => {
    props.onCropCanceled();
  }, []);

  const reset = useCallback(() => {
    setCrop({x: 0, y: 0});
    setZoom(1);
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.wrapper} data-testid='photo-cropper'>
      <div className={classes.cropper}>
        <Cropper
          image={props.src}
          aspect={1}
          cropShape='round'
          crop={crop}
          zoom={zoom}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className={classes.actions}>
        <Action icon='clear' iconColor='red' onClick={cancel}
                data-testid='cancel-crop'/>
        <Action icon='history' onClick={reset} data-testid='reset-crop'/>
        <Action icon='check' iconColor='green' onClick={save}
                data-testid='confirm-crop'/>
      </div>
    </div>
  );
};

const Action = (props: CircleButtonProps) => {
  return (
    <CircleButton {...props} size={40}/>
  );
};

const useStyles = makeStyles({
  wrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'black',
  },
  cropper: {
    position: 'relative',
    height: '90%',
    width: '100%',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '10%',
  }
});

export default PhotoCropper;