import {Avatar, Icon, makeStyles} from "@material-ui/core";
import React from "react";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

export type DeliveryStatusProps = {
  type: DeliveryStatusType,
  date: number,
  photoURL?: string,
}

export enum DeliveryStatusType {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  SEEN = 'SEEN',
  NONE = 'NONE'
}

const DeliveryStatus = (props: DeliveryStatusProps) => {
  const classes = useStyles({type: props.type});

  switch (props.type) {
    case DeliveryStatusType.SENDING:
      return <div className={classes.sending}/>;
    case DeliveryStatusType.SENT:
    case DeliveryStatusType.DELIVERED:
      return (
        <div className={classes.status}>
          <Icon className={classes.statusIcon}>check</Icon>
        </div>
      );
    case DeliveryStatusType.SEEN:
      return (
        <Avatar
          className={classes.seen}
          src={props.photoURL}
        />
      );
    case DeliveryStatusType.NONE:
      return <div/>;
  }
};

const useStyles = makeStyles<Theme, { type: DeliveryStatusType }>(() => {
  const shared: React.CSSProperties = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
  };
  return {
    sending: {
      ...shared,
      border: '1px solid grey',
    },
    seen: {
      ...shared
    },
    status: p => {
      let background;
      if (p.type == DeliveryStatusType.DELIVERED) {
        background = 'grey';
      } else {
        background = 'white';
      }
      return {
        ...shared,
        background,
        border: '1px solid grey',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
    },
    statusIcon: props => ({
      '&&': {
        fontSize: '10px',
        color: props.type == DeliveryStatusType.DELIVERED ? 'white' : 'grey',
      }
    }),
  };
});

export default DeliveryStatus;