import React from "react";
import Conversation from "../../types/conversation";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@material-ui/core";

export type ConversationListItemProps = {
  conversation: Conversation
  style?: React.CSSProperties
};

const ConversationListItem = (props: ConversationListItemProps) => {
  const user = props.conversation.participants[0];
  const message = props.conversation.messages.length > 0
    ? props.conversation.messages[0]
    : undefined;
  const secondary = message ? message.text ?? `Media` : '';
  return (
    <div style={props.style} data-testid='conversation-list-item'>
      <ListItem>
        <ListItemAvatar>
          <Avatar
            src={user.photo?.small}
            alt='conversation-avatar'
          />
        </ListItemAvatar>
        <ListItemText primary={user.username} secondary={secondary}/>
      </ListItem>
    </div>
  );
};


export default ConversationListItem;