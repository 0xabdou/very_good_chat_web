import React, {useCallback} from "react";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {makeStyles} from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import Conversation from "../types/conversation";
import ConversationListItem from "./components/conversation-list-item";
import RetryButton from "../../../shared/components/retry-button";
import useChatActions from "../chat-actions-provider";
import {stringifyChatError} from "../types/chat-error";
import {PulseLoader} from "react-spinners";
import {useHistory} from "react-router-dom";

const ChatScreen = () => {
  const chatState = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();
  const actions = useChatActions();
  const history = useHistory();
  const classes = useStyles();

  const retry = useCallback(() => {
    dispatch(actions.getConversations());
  }, []);

  const onItemClick = useCallback((conversation: Conversation) => {
    const pathname = `/c/${conversation.id}`;
    if (history.location.pathname != pathname)
      history.push(pathname);
  }, [history]);

  const itemKey = useCallback((index: number, data: Conversation[]) => {
    return data[index].id;
  }, []);

  let child: React.ReactNode;
  if (chatState.conversations) {
    const convs = chatState.conversations.filter(c => c.messages.length > 0);
    if (convs.length) {
      child = (
        <AutoSizer>
          {({height, width}) => {
            return (
              <FixedSizeList
                itemCount={convs.length}
                itemData={convs}
                itemKey={itemKey}
                height={height}
                width={width}
                itemSize={72}>
                {({index, style, data}) => {
                  return (
                    <ConversationListItem
                      style={style}
                      conversation={data[index]}
                      onClick={onItemClick}
                    />
                  );
                }}
              </FixedSizeList>
            );
          }}
        </AutoSizer>
      );
    } else {
      child = (
        <span className={classes.centered}>You have no conversations</span>
      );
    }
  } else if (chatState.error != null) {
    child = (
      <div className={classes.centered}>
        <RetryButton
          onClick={retry}
          message={stringifyChatError(chatState.error)}/>
      </div>
    );
  } else {
    child = (
      <div className={classes.centered}>
        <PulseLoader/>
      </div>
    );
  }

  return (
    <div className={classes.outer} data-testid='chat-screen'>
      {child}
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  centered: {
    margin: 'auto',
  }
});

export default ChatScreen;