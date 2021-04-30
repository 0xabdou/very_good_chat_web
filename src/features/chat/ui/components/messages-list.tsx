import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Icon, IconButton, makeStyles} from "@material-ui/core";
import MessageListItem from "./message-list-item/message-list-item";
import {useAppDispatch, useAppSelector} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {PulseLoader} from "react-spinners";
import FullscreenLoader from "../../../../shared/components/fullscreen-loader";
import {shallowEqual} from "react-redux";

export type MessagesListProps = {
  conversationID: number,
}

const MessagesList = (props: MessagesListProps) => {
  const me = useAppSelector(state => state.me.me, shallowEqual)!;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => c.id == props.conversationID),
    shallowEqual
  );
  const typing: boolean = useAppSelector(state => {
    const userID = conversation?.participants[0]?.id;
    if (!userID) return false;
    const typings = state.chat.typing[props.conversationID];
    if (!typings) return false;
    return typings.indexOf(userID) != -1;
  }, shallowEqual);
  // does the conversation have more messages to fetch
  const hasMore: boolean = useAppSelector(state => {
    return state.chat.hasMore[props.conversationID];
  }, shallowEqual);
  const dispatch = useAppDispatch();
  const {getMoreMessages} = useChatActions();
  const [div, setDiv] = useState<HTMLDivElement>();
  const isFetching = useRef<boolean | null>(false);
  const [showArrow, setShowArrow] = useState(false);
  const classes = useStyles({
    showArrow,
    typing,
    hasMore,
  });

  useEffect(() => {
    if (div) div.onscroll = onScroll;
    return () => {
      if (div) div.onscroll = null;
    };
  }, [div]);

  const onMount = useCallback((div: HTMLDivElement) => {
    setDiv(div);
  }, []);

  const onScroll = async () => {
    if (!div) return;
    const sh = div.scrollHeight;
    const st = div.scrollTop;
    const ch = div.clientHeight;
    const diff = sh + st - ch;
    setShowArrow(st <= -1);
    if (diff <= 50 && !isFetching.current && hasMore) {
      isFetching.current = true;
      await dispatch(getMoreMessages(props.conversationID));
      isFetching.current = false;
    }
  };

  const scrollToBottom = useCallback(() => {
    if (div) div.scrollTo({top: 0, behavior: "smooth"});
  }, [div]);

  if (!conversation) return <FullscreenLoader/>;

  const messages = conversation.messages.map((m, i) => {
    return (
      <MessageListItem
        index={i}
        conversationID={props.conversationID}
        currentUserID={me.id}
        key={`${m.id}`}
      />
    );
  });
  return (
    <div className={classes.outer}>
      <div className={classes.messages} ref={onMount}>
        <div>
          <div className={classes.loader} key={new Date().getTime() + 1124}>
            <PulseLoader/>
          </div>
          {messages}
          <div className={classes.typing} key="zblbola">
            <Avatar
              className={classes.typingAvatar}
              src={conversation.participants[0].photo?.small}
            />
            <span className={classes.typingText}>Typing...</span>
          </div>
        </div>
      </div>
      <div className={classes.arrowWrapper}>
        <IconButton
          className={classes.arrow}
          onClick={scrollToBottom}
        >
          <Icon className={classes.arrowIcon}>arrow_downward</Icon>
        </IconButton>
      </div>
    </div>
  );
};

type MessagesListStyle = {
  showArrow?: boolean,
  typing?: boolean,
  hasMore?: boolean,
}

const useStyles = makeStyles<Theme, MessagesListStyle>({
  outer: {
    position: "relative",
    width: '100%',
    overflow: "hidden",
    flex: 1,
  },
  loader: props => ({
    display: props.hasMore ? 'flex' : "none",
    justifyContent: "center",
    alignItems: "center",
    padding: '16px',
  }),
  messages: {
    display: "flex",
    flexDirection: "column-reverse",
    width: "100%",
    height: "100%",
    overflowY: "auto",
  },
  typing: props => ({
    display: "flex",
    alignItems: "center",
    transform: props.typing ? "scale(1)" : "scale(0)",
    width: props.typing ? undefined : 0,
    height: props.typing ? undefined : 0,
    paddingTop: props.typing ? "12px" : 0,
    paddingLeft: "12px",
    transition: "200ms",
  }),
  typingAvatar: {
    width: "20px",
    height: "20px",
    marginRight: "16px",
  },
  typingText: {
    fontSize: "0.9rem",
    color: "grey",
  },
  arrowWrapper: {
    position: "absolute",
    left: "50%",
  },
  arrow: props => ({
    position: "relative",
    margin: "0 auto",
    left: "-50%",
    bottom: props.showArrow ? 50 : -8,
    transition: '500ms',
    background: "black",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.7)",
    }
  }),
  arrowIcon: {
    color: 'white',
  }
});


export default MessagesList;