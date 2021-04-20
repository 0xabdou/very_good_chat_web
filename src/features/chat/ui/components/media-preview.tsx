import React, {useCallback, useEffect, useState} from "react";
import {Icon, IconButton, makeStyles} from "@material-ui/core";

export type MediaPreviewProps = {
  file: File,
  index: number,
  onClear: (index: number) => void,
  key: string | number,
}

const MediaPreview = (props: MediaPreviewProps) => {
  const [url, setUrl] = useState<string>();
  const [type, setType] = useState<"image" | "video">();
  const classes = useMediaPreviewStyles();

  useEffect(() => {
    const ext = props.file.type.split('/')[0].toLowerCase();
    if (ext == "image" || ext == "video") {
      const thumbURL = URL.createObjectURL(props.file);
      setUrl(thumbURL);
      setType(ext);
      return () => URL.revokeObjectURL(thumbURL);
    }
  }, [props.file]);

  const remove = useCallback(() => {
    props.onClear(props.index);
  }, [props.file, props.index]);

  if (!type) return <div/>;
  console.log("TYPE: ", type);
  return (
    <div className={classes.root}>
      <IconButton className={classes.clear} onClick={remove}>
        <Icon className={classes.clearIcon}>cancel</Icon>
        <div className={classes.clearBG}/>
      </IconButton>
      {
        type == "image" &&
        <img
          className={classes.thumb}
          src={url}
          alt='media preview'
        />
      }
      {
        type == "video" &&
        <video
          className={classes.thumb}
          src={url}
          muted
          autoPlay
          controls={false}
        />
      }
    </div>
  );
};

const useMediaPreviewStyles = makeStyles({
  root: {
    position: 'relative',
    height: '50px',
    width: '50px',
    borderRadius: '10px',
    margin: '10px 10px 0 0'
  },
  thumb: {
    height: '48px',
    width: '48px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  clear: {
    position: 'absolute',
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    top: '-10px',
    right: "-10px",
    height: '20px',
    width: '20px',
  },
  clearIcon: {
    '&&': {
      fontSize: '24px',
      color: 'white',
      zIndex: 3,
    }
  },
  clearBG: {
    position: 'absolute',
    background: 'black',
    width: '15px',
    height: '15px',
    borderRadius: "50%",
    zIndex: 2,
  }
});

export default MediaPreview;