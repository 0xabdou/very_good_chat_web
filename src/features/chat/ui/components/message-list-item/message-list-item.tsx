import React, {useRef} from "react";
import {Avatar, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import Message from "../../../types/message";
import DeliveryStatus, {DeliveryStatusType} from "../delivery-status";
import MessageMediaGrid from "./message-media-grid";
import {useAppSelector} from "../../../../../core/redux/hooks";
import {shallowEqual} from "react-redux";
import isUrl from "../../../../../shared/utils/is-url";

export type MessageListItemProps = {
  index: number,
  conversationID: number,
  currentUserID: string,
};

const _sameSender = (message1: Message, message2: Message) => {
  return message1.senderID == message2.senderID;
};

const useMessageSelector = (convID: number, index: number) => {
  return useAppSelector(state => {
    return state.chat.conversations!.find(c => c.id == convID)!.messages[index];
  }, shallowEqual);
};

type messageListItemProps = {
  incoming: boolean,
  bubbleType: BubbleType,
  deliveryStatus: DeliveryStatusType,
  hasMedia: boolean
}

const MessageListItem = React.memo((props: MessageListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const otherUser = useAppSelector(state => {
    return state.chat.conversations!.find(c => c.id == props.conversationID)!
      .participants[0];
  }, shallowEqual);
  const message = useMessageSelector(props.conversationID, props.index);
  const before = useMessageSelector(props.conversationID, props.index - 1);
  const after = useMessageSelector(props.conversationID, props.index + 1);
  const lastSeen = useAppSelector(state => {
    return state.chat.lastSeen[props.conversationID];
  }, shallowEqual);
  const incoming = props.currentUserID != message.senderID;
  let bubbleType: BubbleType;
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
  const lastSeenMessageID = lastSeen[otherUser.id];
  let deliveryStatusType: DeliveryStatusType;
  let date: number;
  if (incoming) {
    if (message.id == lastSeenMessageID)
      deliveryStatusType = DeliveryStatusType.SEEN;
    else
      deliveryStatusType = DeliveryStatusType.NONE;
    date = message.sentAt;
  } else if (!message.sent) {
    deliveryStatusType = DeliveryStatusType.SENDING;
    date = message.sentAt;
  } else if (message.seenBy[0]) {
    if (message.id == lastSeenMessageID)
      deliveryStatusType = DeliveryStatusType.SEEN;
    else
      deliveryStatusType = DeliveryStatusType.NONE;
    date = message.seenBy[0].date;
  } else if (message.deliveredTo[0]) {
    deliveryStatusType = DeliveryStatusType.DELIVERED;
    date = message.deliveredTo[0].date;
  } else {
    deliveryStatusType = DeliveryStatusType.SENT;
    date = message.sentAt;
  }
  const showIncomingAvatar = incoming
    && (!after || (after && !_sameSender(message, after)));
  const hasMedia = Boolean(message.medias && message.medias.length);

  const classes = useStyles({
    incoming,
    bubbleType,
    deliveryStatus: deliveryStatusType,
    hasMedia,
  });
  let messageText: React.ReactNode | undefined;
  if (message.text) {
    const spaces = message.text.match(/\s+/g);
    if (!spaces) {
      if (isUrl(message.text)) {
        messageText = (
          <MessageLink href={message.text} className={classes.bubbleLink}/>
        );
      } else
        messageText = message.text;
    } else {
      const elements: React.ReactNode[] = [];
      const words = message.text.split(/\s+/);
      let currentWord = "";
      words.forEach((word, wordIdx) => {
        if (wordIdx) currentWord = currentWord + spaces[wordIdx - 1];
        if (isUrl(word)) {
          elements.push(currentWord);
          elements.push(
            <MessageLink
              className={classes.bubbleLink}
              href={word}
              key={`${message.id}_${wordIdx}_link`}
            />
          );
          currentWord = "";
        } else {
          currentWord = currentWord + word;
        }
      });
      messageText = [...elements, currentWord];
    }
  }
  return (
    <div data-testid='message-list-item'>
      <div className={classes.wrapper} ref={ref}>
        <div className={classes.incomingAvatarWrapper}>
          {showIncomingAvatar &&
          <Avatar
            className={classes.incomingAvatar}
            src={otherUser.photo?.small}
          />}
        </div>
        <div className={classes.bubble}>
          {
            hasMedia &&
            <MessageMediaGrid medias={message.medias!} messageID={message.id}/>
          }
          {
            messageText &&
            <div className={classes.bubbleTextWrapper}>
              <span className={classes.bubbleText}>{messageText}</span>
            </div>
          }
        </div>
        <div className={classes.status}>
          <DeliveryStatus
            type={deliveryStatusType}
            date={date}
            photoURL={otherUser.photo?.small}
          />
        </div>
      </div>
    </div>
  );
});

type MessageLinkProps = {
  href: string,
  className: string,
};

const MessageLink = ({href, className}: MessageLinkProps) => {
  return (
    <a className={className} href={href} target="_blank">
      {href}
    </a>
  );
};

enum BubbleType {
  ISOLATED = 'ISOLATED',
  FIRST = 'FIRST',
  MIDDLE = 'MIDDLE',
  LAST = 'LAST'
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

const useStyles = makeStyles<Theme, messageListItemProps>({
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
      padding: '2px',
      maxWidth: '70%',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      borderRadius: `${tl} ${tr} ${br} ${bl}`,
      background,
      color
    };
  },
  bubbleTextWrapper: {
    margin: '8px 12px',
  },
  bubbleText: {
    whiteSpace: 'pre-wrap',
  },
  bubbleLink: {
    textDecoration: "underline"
  },
  status: {
    marginLeft: props => props.incoming ? 'auto' : '4px',
    marginRight: '4px',
    marginTop: 'auto',
    width: '14px',
    height: '14px',
  },
  incomingAvatarWrapper: {
    width: '28px',
    height: '28px',
    marginTop: 'auto',
    marginLeft: '8px',
    marginRight: '8px',
  },
  incomingAvatar: {
    width: '28px',
    height: '28px',
  }
});

export default MessageListItem;