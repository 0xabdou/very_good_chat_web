import {FriendRequest} from "../../types/friend-request";
import React, {useCallback} from "react";
import User from "../../../user/types/user";
import {
  Avatar,
  Icon,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {PulseLoader} from "react-spinners";
import {formatDate} from "../../../../shared/utils/date-utils";

export type RequestListItemProps = {
  req: FriendRequest,
  style?: React.CSSProperties
  received?: Boolean,
  loading?: Boolean
  onClick?: (user: User) => void,
  onAccept?: (user: User) => void,
  onCancel?: (user: User) => void,
}
const RequestListItem = (props: RequestListItemProps) => {
  const classes = useStyles();
  const user = props.req.user;

  const onClick = useCallback(() => {
    if (props.onClick) props.onClick(user);
  }, [props.onClick]);

  const onAccept = useCallback(() => {
    if (props.onAccept) props.onAccept(user);
  }, [props.onClick]);

  const onCancel = useCallback(() => {
    if (props.onCancel) props.onCancel(user);
  }, [props.onClick]);

  const secondary = `${props.received ? 'received' : 'sent'} ${formatDate(props.req.date)}`;
  return (
    <div style={props.style} data-testid='request-list-item'>
      <ListItem
        className={classes.item}
        onClick={onClick}
        button>
        <ListItemAvatar>
          <Avatar src={user.photo?.small} alt='request-avatar'/>
        </ListItemAvatar>
        <ListItemText
          primary={user.username}
          secondary={secondary}
        />
      </ListItem>
      <div className={classes.actions} data-testid='request-actions'>
        {props.loading &&
        <span data-testid='request-loading'>
            <PulseLoader size={10} color='grey'/>
          </span>}
        {!props.loading &&
        <IconButton aria-label="cancel" onClick={onCancel}
                    data-testid='cancel-request'>
          <Icon className={classes.clear}>clear</Icon>
        </IconButton>}
        {!props.loading && props.received &&
        <IconButton aria-label="accept" onClick={onAccept}
                    data-testid='accept-request'>
          <Icon className={classes.check}>check</Icon>
        </IconButton>}
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  item: {
    position: 'relative',
    minHeight: '72px'
  },
  actions: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  clear: {
    color: 'red'
  },
  check: {
    color: 'green'
  },
  dot: {
    '& .MuiBadge-badge': {
      background: '#5dda4e',
      color: 'white',
    },
    '& .MuiBadge-dot': {
      border: '1px solid white',
      borderRadius: '50%',
      height: '14px',
      width: '14px',
      margin: '5px',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      background: '#317529',
      color: 'white',
      fontSize: '0.5rem',
      border: '1px solid white',
      margin: '2px',
    }
  }
});

export default RequestListItem;