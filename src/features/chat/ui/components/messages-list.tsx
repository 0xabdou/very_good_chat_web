import React, {useCallback, useState} from "react";
import {makeStyles} from "@material-ui/core";
import Message from "../../types/message";
import MessageListItem from "./message-list-item/message-list-item";
import {ItemContent, Virtuoso} from "react-virtuoso";
import AutoSizer from "react-virtualized-auto-sizer";
import Conversation from "../../types/conversation";
import {useAppDispatch} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {PulseLoader} from "react-spinners";

export type MessagesListProps = {
  conversation: Conversation,
  currentUserID: string,
}

const MessagesList = (props: MessagesListProps) => {
  const START_INDEX = 1000000000;
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [initialTopMostItemIndex] = useState(props.conversation.messages.length - 1);
  const dispatch = useAppDispatch();
  const {getMoreMessages} = useChatActions();
  const classes = useStyles();

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
              followOutput="smooth"
              overscan={600}
              components={{
                Header: () => <ListLoader
                  loading={props.conversation.fetchingMore}/>
              }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};
const ListLoader = ({loading}: { loading?: boolean }) => {
  const classes = useStyles();
  if (!loading) return <div/>;
  return (
    <div className={classes.loader}>
      <PulseLoader/>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    flexGrow: 1,
    overflowY: 'auto',
  },
  loader: {
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    padding: '16px',
  }
});


export default MessagesList;