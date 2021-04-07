import React, {useCallback} from "react";
import {makeStyles} from "@material-ui/core";
import Message from "../../types/message";
import MessageListItem from "./message-list-item";
import {ItemContent, Virtuoso} from "react-virtuoso";
import AutoSizer from "react-virtualized-auto-sizer";
import Conversation from "../../types/conversation";

export type MessagesListProps = {
  conversation: Conversation,
  currentUserID: string,
}

const MessagesList = (props: MessagesListProps) => {
  const classes = useStyles();

  const itemContent: ItemContent<Message> = useCallback((index) => {
    return (
      <MessageListItem
        conversation={props.conversation}
        index={index}
        currentUserID={props.currentUserID}
      />
    );
  }, [props.conversation, props.currentUserID]);

  return (
    <div className={classes.outer}>
      <AutoSizer>
        {({width, height}) => {
          return (
            <Virtuoso
              style={{height, width, overflowX: 'hidden'}}
              data={props.conversation.messages}
              itemContent={itemContent}
              followOutput="smooth"
              initialTopMostItemIndex={props.conversation.messages.length - 1}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    flexGrow: 1,
    overflowY: 'auto',
  },
});

export default MessagesList;