import React from "react";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import useChatActions from "../chat-actions-provider";
import ChatTextField from "./components/chat-text-field";
import MessagesList from "./components/messages-list";

const ConversationScreen = () => {
  const dispatch = useAppDispatch();
  const chatActions = useChatActions();
  const me = useAppSelector(state => state.me.me);
  const conversationID = useParams<{ id: string }>().id;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => `${c.id}` == conversationID)
  );
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

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