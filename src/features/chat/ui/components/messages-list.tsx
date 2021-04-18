import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Icon, IconButton, makeStyles} from "@material-ui/core";
import MessageListItem from "./message-list-item/message-list-item";
import Conversation from "../../types/conversation";
import {useAppDispatch} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {PulseLoader} from "react-spinners";

export type MessagesListProps = {
  conversation: Conversation,
  currentUserID: string,
  hasMore: boolean,
  fetchingMore: boolean,
  lastSeen: { [userID: string]: number },
  typing?: boolean
}

const MessagesList = (props: MessagesListProps) => {
  const dispatch = useAppDispatch();
  const {getMoreMessages} = useChatActions();
  const ref = useRef<HTMLDivElement>(null);
  const isFetching = useRef<boolean | null>(false);
  const [showArrow, setShowArrow] = useState(false);
  const classes = useStyles({
    showArrow,
    typing: props.typing,
    fetchingMore: props.fetchingMore,
  });

  useEffect(() => {
    if (ref.current) ref.current.onscroll = onScroll;
    return () => {
      if (ref.current) ref.current.onscroll = null;
    };
  }, [ref.current]);

  const onScroll = async () => {
    const d = ref.current;
    if (!d) return console.log("REF CUR NULL");
    const sh = d.scrollHeight;
    const st = d.scrollTop;
    const ch = d.clientHeight;
    const diff = sh + st - ch;
    setShowArrow(st <= -120);
    if (diff <= 50 && !isFetching.current && props.hasMore) {
      isFetching.current = true;
      console.log("HALAW BOOM BOOM");
      await dispatch(getMoreMessages(props.conversation.id));
      isFetching.current = false;
    }
  };

  const scrollToBottom = useCallback(() => {
    if (ref.current) ref.current.scrollTo({top: 0, behavior: "smooth"});
  }, [ref.current]);

  const messages = props.conversation.messages.map((m, i) => {
    return (
      <MessageListItem
        conversation={props.conversation}
        index={i}
        currentUserID={props.currentUserID}
        lastSeen={props.lastSeen}
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
              src={props.conversation.participants[0].photo?.small}
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
  fetchingMore?: boolean,
}

const useStyles = makeStyles<Theme, MessagesListStyle>({
  outer: {
    position: "relative",
    width: '100%',
    flexGrow: 1,
    overflow: "hidden",
  },
  loader: props => ({
    display: props.fetchingMore ? 'flex' : "none",
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

//<AutoSizer>
//  {({width, height}) => {
//    return (
//      <Virtuoso
//        firstItemIndex={firstItemIndex}
//        initialTopMostItemIndex={initialTopMostItemIndex}
//        data={props.conversation.messages}
//        startReached={getMore}
//        itemContent={itemContent}
//        style={{height, width, overflowX: 'hidden'}}
//        atBottomStateChange={bottomStateChanged}
//        followOutput={followOutput}
//        overscan={600}
//        components={{
//          Header: () => (
//            <div className={classes.loader}>
//              <PulseLoader/>
//            </div>
//          ),
//          Footer: () => (
//            <div className={classes.typing}>
//              <Avatar
//                className={classes.typingAvatar}
//                src={props.conversation.participants[0].photo?.small}
//              />
//              <span className={classes.typingText}>Typing...</span>
//            </div>
//          )
//        }}
//        ref={ref}
//        itemsRendered={itemsRendered}
//      />
//    );
//  }}
//</AutoSizer>