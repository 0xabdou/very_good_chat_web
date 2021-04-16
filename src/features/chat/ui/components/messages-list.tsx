import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, Icon, IconButton, makeStyles} from "@material-ui/core";
import Message from "../../types/message";
import MessageListItem from "./message-list-item/message-list-item";
import {ItemContent, ListItem, Virtuoso, VirtuosoHandle} from "react-virtuoso";
import AutoSizer from "react-virtualized-auto-sizer";
import Conversation from "../../types/conversation";
import {useAppDispatch} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {PulseLoader} from "react-spinners";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

export type MessagesListProps = {
  conversation: Conversation,
  currentUserID: string,
  typing?: boolean
}

const MessagesList = (props: MessagesListProps) => {
  const START_INDEX = 1000000000;
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [initialTopMostItemIndex] = useState(props.conversation.messages.length - 1);
  const dispatch = useAppDispatch();
  const {getMoreMessages} = useChatActions();
  const ref = useRef<VirtuosoHandle>(null);
  const isAtBottom = useRef<boolean | null>(null);
  const lastMsgID = useRef<number | null>(null);
  const [showArrow, setShowArrow] = useState(false);
  const classes = useStyles({showArrow, typing: props.typing});

  useEffect(() => {
    lastMsgID.current =
      props.conversation.messages[props.conversation.messages.length - 1].id;
  }, [props.conversation.messages]);

  useEffect(() => {
    if (props.typing && isAtBottom.current)
      scrollToBottom();
  }, [props.typing, isAtBottom.current]);

  const itemContent: ItemContent<Message> = useCallback((index) => {
    return (
      <MessageListItem
        conversation={props.conversation}
        index={index - firstItemIndex}
        currentUserID={props.currentUserID}
      />
    );
  }, [props.conversation, props.currentUserID, firstItemIndex]);

  const getMore = useCallback(async () => {
    if (props.conversation.fetchingMore) return;
    if (props.conversation.hasMore) {
      const result = await dispatch(getMoreMessages(props.conversation.id));
      if (result.meta.requestStatus == "fulfilled") {
        const fetched = result.payload as Message[];
        setFirstItemIndex(idx => idx - fetched.length);
      }
    }
  }, [props.conversation, setFirstItemIndex, dispatch]);

  const scrollToBottom = useCallback(() => {
    ref.current?.scrollToIndex({
      index: START_INDEX + 1000,
      behavior: "smooth"
    });
  }, [ref.current]);

  const bottomStateChanged = useCallback((state: boolean) => {
    isAtBottom.current = state;
  }, [isAtBottom]);

  const followOutput = useCallback(
    () => {
      const lastMsg = props.conversation.messages[props.conversation.messages.length - 1];
      if (lastMsg.id != lastMsgID.current) {
        if (isAtBottom.current || lastMsg.senderID == props.currentUserID) {
          setTimeout(scrollToBottom, 100);
        }
      }
      return false;
    },
    [props.conversation.messages,
      props.currentUserID,
      isAtBottom.current,
      lastMsgID.current,
      ref.current]
  );

  const itemsRendered = useCallback((items: ListItem<Message>[]) => {
    const last = items[items.length - 1]?.data?.id;
    if (last != lastMsgID.current) setShowArrow(true);
    else setShowArrow(false);
  }, [lastMsgID.current, setShowArrow]);

  return (
    <div className={classes.outer}>
      <AutoSizer>
        {({width, height}) => {
          return (
            <Virtuoso
              firstItemIndex={firstItemIndex}
              initialTopMostItemIndex={initialTopMostItemIndex}
              data={props.conversation.messages}
              startReached={getMore}
              itemContent={itemContent}
              style={{height, width, overflowX: 'hidden'}}
              atBottomStateChange={bottomStateChanged}
              followOutput={followOutput}
              overscan={600}
              components={{
                Header: () => (
                  <div className={classes.loader}>
                    <PulseLoader/>
                  </div>
                ),
                Footer: () => (
                  <div className={classes.typing}>
                    <Avatar
                      className={classes.typingAvatar}
                      src={props.conversation.participants[0].photo?.small}
                    />
                    <span className={classes.typingText}>Typing...</span>
                  </div>
                )
              }}
              ref={ref}
              itemsRendered={itemsRendered}
            />
          );
        }}
      </AutoSizer>
      <IconButton className={classes.arrow} onClick={scrollToBottom}>
        <Icon className={classes.arrowIcon}>arrow_downward</Icon>
      </IconButton>
    </div>
  );
};

type MessagesListStyle = {
  showArrow?: boolean,
  typing?: boolean,
}

const useStyles = makeStyles<Theme, MessagesListStyle>({
  outer: {
    position: "relative",
    width: '100%',
    flexGrow: 1,
    overflow: "hidden",
  },
  loader: {
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    padding: '16px',
  },
  typing: props => ({
    display: "flex",
    alignItems: "center",
    transform: props.typing ? "scale(1)" : "scale(0)",
    width: props.typing ? undefined : 0,
    height: props.typing ? undefined : 0,
    paddingTop: "24px",
    paddingLeft: "12px",
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