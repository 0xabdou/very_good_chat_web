import React, {useRef} from "react";
import {Avatar, Icon, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import Message from "../../types/message";
import Conversation from "../../types/conversation";

export type MessageListItemProps = {
  conversation: Conversation,
  index: number,
  currentUserID: string,
};

const _sameSender = (message1: Message, message2: Message) => {
  return message1.senderID == message2.senderID;
};

const MessageListItem = React.memo((props: MessageListItemProps) => {
  const messages = props.conversation.messages;
  const index = props.index;
  const message = messages[index];
  const incoming = props.currentUserID != message.senderID;
  const otherUser = props.conversation.participants[0];
  const ref = useRef<HTMLDivElement>(null);
  let bubbleType: BubbleType;
  const before = messages[index - 1];
  const after = messages[index + 1];
  if (!before && !after) bubbleType = BubbleType.ISOLATED;
  else if (before && after) {
    if (_sameSender(message, before)) {
      if (_sameSender(message, after)) bubbleType = BubbleType.MIDDLE;
      else bubbleType = BubbleType.LAST;
    } else {
      if (_sameSender(message, after)) bubbleType = BubbleType.FIRST;
      else bubbleType = BubbleType.ISOLATED;
    }
  } else if (after) {
    if (_sameSender(message, after)) bubbleType = BubbleType.FIRST;
    else bubbleType = BubbleType.ISOLATED;
  } else {
    if (_sameSender(message, before)) bubbleType = BubbleType.LAST;
    else bubbleType = BubbleType.ISOLATED;
  }
  let deliveryStatus: DeliveryStatus;
  deliveryStatus = DeliveryStatus.NONE;

  const classes = useStyles({incoming, bubbleType, deliveryStatus});

  return (
    <div data-testid='message-list-item'>
      <div className={classes.wrapper} ref={ref}>
        {incoming &&
        <Avatar className={classes.sender} src={otherUser.photo?.small}/>}
        <div className={classes.bubble}>
          {message.text}
        </div>
        <div className={classes.status}>
          <Icon className={classes.statusIcon}>check</Icon>
        </div>
      </div>
    </div>
  );
});

enum BubbleType {
  ISOLATED = 'ISOLATED',
  FIRST = 'FIRST',
  MIDDLE = 'MIDDLE',
  LAST = 'LAST'
}

enum DeliveryStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  SEEN = 'SEEN',
  NONE = 'NONE'
}

type MessageListStyleProps = {
  incoming: boolean,
  bubbleType: BubbleType,
  deliveryStatus: DeliveryStatus,
}

const _getBorderRadius = (type: BubbleType): [string, string] => {
  switch (type) {
    case BubbleType.FIRST:
      return ['18px', '4px'];
    case BubbleType.LAST:
      return ['4px', '18px'];
    case BubbleType.MIDDLE:
      return ['4px', '4px'];
    case BubbleType.ISOLATED:
      return ['18px', '18px'];
  }
};

const useStyles = makeStyles<Theme, MessageListStyleProps>({
  wrapper: props => ({
    display: 'flex',
    justifyContent: props.incoming ? 'flex-start' : 'flex-end',
  }),
  bubble: props => {
    let background, color: string;
    let tl, tr, bl, br: string;
    if (props.incoming) {
      background = 'grey';
      color = 'black';
      tr = br = '18px';
      [tl, bl] = _getBorderRadius(props.bubbleType);
    } else {
      background = 'black';
      color = 'white';
      tl = bl = '18px';
      [tr, br] = _getBorderRadius(props.bubbleType);
    }
    return {
      margin: '1px',
      padding: '8px 12px',
      maxWidth: '70%',
      overflowWrap: 'break-word',
      borderRadius: `${tl} ${tr} ${br} ${bl}`,
      background,
      color
    };
  },
  status: {
    marginLeft: props => props.incoming ? 'auto' : '4px',
    marginRight: '4px',
    marginTop: 'auto',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'grey',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    '&&': {
      fontSize: '10px',
      color: 'white',
    }
  },
  sender: {
    marginTop: 'auto',
    marginLeft: '8px',
    marginRight: '8px',
    width: '28px',
    height: '28px',
  }
});

export default MessageListItem;