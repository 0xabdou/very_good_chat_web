import React, {useCallback} from "react";
import Conversation from "../../types/conversation";
import {
  Avatar,
  createStyles,
  Icon,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {MediaType} from "../../types/media";
import {formatDate} from "../../../../shared/utils/date-utils";
import DeliveryStatus, {DeliveryStatusType} from "./delivery-status";

export type ConversationListItemProps = {
  conversation: Conversation,
  currentUserID: string,
  typing: boolean,
  onClick: (conversation: Conversation) => void,
  style?: React.CSSProperties
};

const ConversationListItem = (props: ConversationListItemProps) => {
  const message = props.conversation.messages.length > 0
    ? props.conversation.messages[props.conversation.messages.length - 1]
    : undefined;
  console.log("MESSAGE: ", message);
  const mine = message?.senderID == props.currentUserID;
  const seen = Boolean(mine || message?.seenBy[0]);
  const classes = useStyles({seen});

  const onClick = useCallback(() => {
    props.onClick(props.conversation);
  }, [props.conversation, props.onClick]);


  if (!message) return <div/>;
  const user = props.conversation.participants[0];
  const primary = (
    <span className={classes.primary}>
      {user.username}
    </span>
  );
  let secondary: React.ReactNode;
  let status: DeliveryStatusType;
  if (!message.sent) status = DeliveryStatusType.SENDING;
  else if (!mine) status = DeliveryStatusType.SEEN;
  else {
    if (message.seenBy[0]) status = DeliveryStatusType.SEEN;
    else if (message.deliveredTo[0]) status = DeliveryStatusType.DELIVERED;
    else status = DeliveryStatusType.SENT;
  }
  if (props.typing) {
    secondary = <span className={classes.secondary}>Typing...</span>;
  } else if (message.text) {
    secondary = (
      <div className={classes.secondary}>
        <span className={classes.secondaryText}>
          {mine && "You: "}{message.text}
        </span>
        <span>- {formatDate(message.sentAt, "mini-minute-now")}</span>
      </div>
    );
  } else if (message.medias?.length) {
    let icon, text: string;
    if (message.medias[0].type == MediaType.VIDEO) {
      icon = "videocam";
      text = "Video";
    } else {
      icon = "photo_camera";
      text = "Photo";
    }
    secondary = <span><Icon>{icon}</Icon> {text}</span>;
  } else {
    secondary = "";
  }

  return (
    <div style={props.style} data-testid='conversation-list-item'>
      <ListItem button onClick={onClick}>
        <ListItemAvatar>
          <Avatar
            src={user.photo?.small}
            alt='conversation-avatar'
          />
        </ListItemAvatar>
        <ListItemText primary={primary} secondary={secondary}/>
        {!seen && <div className={classes.dot}/>}
        {
          seen &&
          <DeliveryStatus
            type={status}
            date={message.sentAt}
            photoURL={user.photo?.small}
          />
        }
      </ListItem>
    </div>
  );
};
type StyleProps = {
  seen: boolean
}
const useStyles = makeStyles<Theme, StyleProps>(() => {
  const blue = '#2F88FB';
  return createStyles({
    dot: {
      maxHeight: '10px',
      maxWidth: '10px',
      minHeight: '10px',
      minWidth: '10px',
      borderRadius: '50%',
      background: blue
    },
    primary: props => ({
      fontWeight: props.seen ? undefined : "bold",
      color: "black",
    }),
    secondary: {
      display: "flex",
    },
    secondaryText: props => ({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "80%",
      color: props.seen ? "grey" : "black",
      fontWeight: props.seen ? undefined : "bold",
      paddingRight: "5px",
      boxSizing: "border-box",
    })
  });
});

export default ConversationListItem;