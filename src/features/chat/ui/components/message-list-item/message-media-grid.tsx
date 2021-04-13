import React, {useCallback, useState} from "react";
import {Media} from "../../../types/media";
import {makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import MessageMediaCell from "./message-media-cell";
import FullscreenMessageMedia from "./fullscreen-message-media";

type MessageMediaGridProps = {
  medias: Media[],
  messageID: number,
}

const MessageMediaGrid = (props: MessageMediaGridProps) => {
  const classes = useStyles({count: props.medias.length});
  const [isMediaFullscreen, setMediaFullscreen] = useState(false);
  const [clickedMediaIndex, setSelectedMediaIndex] = useState(0);

  const onClick = useCallback((index: number) => {
    setMediaFullscreen(true);
    setSelectedMediaIndex(index);
  }, [setMediaFullscreen, setSelectedMediaIndex]);

  const onClose = useCallback(() => {
    setMediaFullscreen(false);
  }, [setMediaFullscreen]);

  let cells: React.ReactElement[] = [];
  for (let i = 0; i < 4 && i < props.medias.length; i++) {
    const media = props.medias[i];
    let className = classes.cell;
    if (!i && props.medias.length == 3)
      className = `${className} ${classes.firstOfThree}`;
    else if (i == 3 && props.medias.length > 4)
      className = `${className} ${classes.lastOfFour}`;
    const key = `${props.messageID}_${i}`;
    cells.push(
      <MessageMediaCell
        className={className}
        onClick={onClick}
        media={media}
        index={i}
        key={key}
      />
    );
  }
  return (
    <div className={classes.grid}>
      {cells}
      <FullscreenMessageMedia
        visible={isMediaFullscreen}
        medias={props.medias}
        initialIndex={clickedMediaIndex}
        onClose={onClose}
      />
    </div>
  );
};

type BubbleMediasStyle = {
  count: number,
}

const useStyles = makeStyles<Theme, BubbleMediasStyle>({
  closeButton: {
    position: "absolute",
    color: 'white',
    background: 'rgba(0,0,0,0.1)'
  },
  fullScreen: {
    position: "relative",
    width: '100%',
    height: '100%',
  },
  grid: (props) => {
    let gridTemplate: string | undefined;
    if (props.count == 2)
      gridTemplate = '1fr / 1fr 1fr';
    else if (props.count > 2)
      gridTemplate = '1fr 1fr / 1fr 1fr';
    return {
      display: 'grid',
      gap: '2px',
      gridTemplate
    };
  },
  cell: (props) => {
    let height: string;
    if (props.count > 2) height = '150px';
    else height = '300px';
    return {
      position: 'relative',
      width: '100%',
      height,
      boxSizing: 'border-box',
    };
  },
  firstOfThree: {
    gridColumn: '1 / 3',
  },
  lastOfFour: {
    position: 'relative',
    '&::after': {
      content: props => `"+${props.count - 3}"`,
      position: "absolute",
      top: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      fontSize: "2rem",
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(5px)',
      boxSizing: 'border-box',
      borderRadius: '16px',
      color: 'white',
    }
  },
});

export default MessageMediaGrid;