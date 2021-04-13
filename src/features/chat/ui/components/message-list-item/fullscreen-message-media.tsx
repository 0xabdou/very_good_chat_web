import {Media, MediaType} from "../../../types/media";
import {Icon, IconButton, makeStyles} from "@material-ui/core";
import FullScreenDialog from "../../../../user/ui/components/fullscreen-dialog";
import React from "react";
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore, {Navigation, Pagination} from 'swiper';

export type FullscreenMessageMediaProps = {
  visible: boolean,
  medias: Media[],
  initialIndex: number,
  onClose: () => void,
};

SwiperCore.use([Navigation, Pagination]);

const FullscreenMessageMedia = (props: FullscreenMessageMediaProps) => {
  const classes = useStyles();

  const slides = props.medias.map(media => {
    const slide = media.type == MediaType.IMAGE
      ? <img className={classes.media} src={media.url} alt='media'/>
      : <video className={classes.media} src={media.url} controls/>;
    return <SwiperSlide key={`${media.url}`}>{slide}</SwiperSlide>;
  });
  return (
    <FullScreenDialog visible={props.visible}>
      <IconButton className={classes.closeButton} onClick={props.onClose}>
        <Icon>clear</Icon>
      </IconButton>
      <Swiper
        className={classes.root}
        initialSlide={props.initialIndex}
        navigation
        pagination
      >
        {slides}
      </Swiper>
    </FullScreenDialog>
  );
};

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: '100%',
    height: '100%',
  },
  media: {
    height: '100%',
    width: '100%',
    objectFit: 'contain',
    background: 'black',
    outline: 'none'
  },
  closeButton: {
    position: 'absolute',
    zIndex: 1000,
    color: 'white',
    background: 'rgba(0, 0, 0, 0.1)',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)'
    }
  }
});

export default FullscreenMessageMedia;