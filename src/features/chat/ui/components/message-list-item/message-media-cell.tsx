import {Media, MediaType} from "../../../types/media";
import React, {useCallback} from "react";
import {ButtonBase, Icon, makeStyles} from "@material-ui/core";

type MessageMediaCellProps = {
  media: Media,
  index: number,
  onClick: (index: number) => void,
  className?: string,
}

const MessageMediaCell = (props: MessageMediaCellProps) => {
  const classes = useStyles({count: 1});

  const onClick = useCallback(() => {
    props.onClick(props.index);
  }, [props.onClick, props.index]);

  return (
    <ButtonBase className={props.className} onClick={onClick}>
      {
        props.media.type == MediaType.IMAGE
          ? <img className={classes.media} src={props.media.thumbUrl}
                 alt='media'/>
          : <video className={classes.media} src={props.media.url}/>
      }
      {
        props.media.type == MediaType.VIDEO &&
        <div className={classes.play}>
          <Icon className={classes.playIcon}>play_circle</Icon>
        </div>
      }
    </ButtonBase>
  );
};

const useStyles = makeStyles({
  media: {
    objectFit: 'cover',
    borderRadius: '16px',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  },
  play: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    height: '100%',
    borderRadius: '16px',
  },
  playIcon: {
    "&&": {
      background: "rgba(0,0,0,0.3)",
      borderRadius: "50%",
      color: 'white',
      fontSize: "3rem"
    }
  }
});

export default MessageMediaCell;