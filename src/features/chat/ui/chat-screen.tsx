import React, {useCallback} from "react";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import {makeStyles} from "@material-ui/core";
import Conversation from "../types/conversation";
import ConversationListItem from "./components/conversation-list-item";
import RetryButton from "../../../shared/components/retry-button";
import useChatActions from "../chat-actions-provider";
import {stringifyChatError} from "../types/chat-error";
import {PulseLoader} from "react-spinners";
import {useHistory} from "react-router-dom";

const ChatScreen = () => {
  const chatState = useAppSelector(state => state.chat);
  const me = useAppSelector(state => state.me.me);
  const typings = useAppSelector(state => {
    let newTypings: { [convID: string]: boolean } = {};
    state.chat.conversations?.forEach(conv => {
      const userID = conv.participants[0].id;
      const convTypings = state.chat.typing[conv.id];
      if (!convTypings)
        newTypings[conv.id] = false;
      else
        newTypings[conv.id] = convTypings.indexOf(userID) != -1;
    });
    return newTypings;
  });
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
      history.push(pathname, {canGoBack: true});
  }, [history]);

  let child: React.ReactNode;
  if (chatState.conversations) {
    const convs = chatState.conversations.filter(c => c.messages.length > 0);
    if (convs.length) {
      child = (
        <>
          {convs.map((c, idx) => {
            return (
              <ConversationListItem
                conversation={c}
                currentUserID={me?.id ?? ""}
                typing={typings[c.id]}
                onClick={onItemClick}
                key={idx}
              />
            );
          })}
        </>
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
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden"
  },
  centered: {
    margin: 'auto',
  },
});

export default ChatScreen;