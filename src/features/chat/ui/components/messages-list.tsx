import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Icon, IconButton, makeStyles} from "@material-ui/core";
import MessageListItem from "./message-list-item/message-list-item";
import {useAppDispatch, useAppSelector} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {PulseLoader} from "react-spinners";
import FullscreenLoader from "../../../../shared/components/fullscreen-loader";

export type MessagesListProps = {
  conversationID: number,
}

const MessagesList = (props: MessagesListProps) => {
  const me = useAppSelector(state => state.me.me)!;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => c.id == props.conversationID)
  );
  const typing: boolean = useAppSelector(state => {
    const userID = conversation?.participants[0]?.id;
    if (!userID) return false;
    const typings = state.chat.typing[props.conversationID];
    if (!typings) return false;
    return typings.indexOf(userID) != -1;
  });
  // does the conversation have more messages to fetch
  const hasMore: boolean = useAppSelector(state => {
    return state.chat.hasMore[props.conversationID];
  });
  const dispatch = useAppDispatch();
  const {getMoreMessages} = useChatActions();
  const ref = useRef<HTMLDivElement>(null);
  const isFetching = useRef<boolean | null>(false);
  const [showArrow, setShowArrow] = useState(false);
  const classes = useStyles({
    showArrow,
    typing,
    hasMore,
  });

  useEffect(() => {
    if (ref.current) ref.current.onscroll = onScroll;
    return () => {
      if (ref.current) ref.current.onscroll = null;
    };
  }, [ref.current]);

  const onScroll = async () => {
    const d = ref.current;
    if (!d) return;
    const sh = d.scrollHeight;
    const st = d.scrollTop;
    const ch = d.clientHeight;
    const diff = sh + st - ch;
    setShowArrow(st <= -1);
    if (diff <= 50 && !isFetching.current && hasMore) {
      isFetching.current = true;
      await dispatch(getMoreMessages(props.conversationID));
      isFetching.current = false;
    }
  };

  const scrollToBottom = useCallback(() => {
    if (ref.current) ref.current.scrollTo({top: 0, behavior: "smooth"});
  }, [ref.current]);

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
      <div className={classes.messages} ref={ref}>
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
      <IconButton
        className={classes.arrow}
        onClick={scrollToBottom}
      >
        <Icon className={classes.arrowIcon}>arrow_downward</Icon>
      </IconButton>
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
    flexGrow: 1,
    overflow: "hidden",
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
    paddingTop: "24px",
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
  arrow: props => ({
    position: "absolute",
    right: 0,
    left: 0,
    margin: "0 auto",
    bottom: props.showArrow ? 8 : -50,
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