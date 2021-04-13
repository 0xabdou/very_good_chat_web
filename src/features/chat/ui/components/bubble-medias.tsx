import React from "react";
import {Media, MediaType} from "../../types/media";
import {makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

type BubbleMediasProps = {
  medias: Media[],
  messageID: number,
}

const BubbleMedias = (props: BubbleMediasProps) => {
  const classes = useStyles({count: props.medias.length});
  let children: React.ReactElement[] = [];
  for (let i = 0; i < 4 && i < props.medias.length; i++) {
    let className: string;
    if (!i && props.medias.length == 3)
      className = `${classes.img} ${classes.firstOfThree}`;
    else
      className = classes.img;
    const key = `${props.messageID}_${i}`;
    const media = props.medias[i].type == MediaType.IMAGE
      ? <img className={className} src={props.medias[i].thumbUrl} key={key}/>
      : <div className={className} key={key}>
        <video className={classes.video} src={props.medias[i].url} controls/>
      </div>;
    let element: React.ReactElement;
    if (i == 3 && props.medias.length > 4) {
      element = (
        <div className={classes.lastOfFour}>
          {media}
        </div>
      );
    } else {
      element = media;
    }
    children.push(element);
  }
  return (
    <div className={classes.root}>
      {children}
    </div>
  );
};

type BubbleMediasStyle = {
  count: number,
}

const useStyles = makeStyles<Theme, BubbleMediasStyle>({
  root: (props) => {
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
  img: (props) => {
    let height: string;
    if (props.count > 2) height = '150px';
    else height = '300px';
    return {
      width: '100%',
      height,
      objectFit: 'cover',
      boxSizing: 'border-box',
      borderRadius: '16px',
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
    }
  },
  video: {
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '16px',
    outline: 'none'
  }
});

export default BubbleMedias;