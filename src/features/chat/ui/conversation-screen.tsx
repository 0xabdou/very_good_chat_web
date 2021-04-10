import React, {useEffect, useState} from "react";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import useChatActions from "../chat-actions-provider";
import ChatTextField from "./components/chat-text-field";
import MessagesList from "./components/messages-list";

const ConversationScreen = () => {
  const dispatch = useAppDispatch();
  const chatActions = useChatActions();
  const [isActive, setIsActive] = useState(document.hasFocus());
  const me = useAppSelector(state => state.me.me);
  const conversationID = useParams<{ id: string }>().id;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => `${c.id}` == conversationID)
  );
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    window.onblur = () => setIsActive(false);
    window.onfocus = () => setIsActive(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      dispatch(chatActions.messagesSeen(Number(conversationID)));
    }
  }, [isActive]);

  if (!conversation) return <FullscreenLoader/>;

  const otherUser = conversation.participants[0];
  return (
    <div className={classes.outer} data-testid='conversation-screen'>
      <TopBar>
        <Avatar
          src={otherUser?.photo?.small}
          alt='conversation-avatar'
          className={topBarClasses.leading}
        />
        <Typography variant='h6' className={topBarClasses.title}>
          {otherUser?.name ?? otherUser?.username}
        </Typography>
      </TopBar>
      <MessagesList conversation={conversation} currentUserID={me?.id ?? ''}/>
      <ChatTextField conversationID={conversation.id}/>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    paddingTop: '56px',
  }
});

export default ConversationScreen;