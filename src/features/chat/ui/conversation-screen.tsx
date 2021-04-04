import React from "react";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import FullscreenLoader from "../../../components/fullscreen-loader";
import useChatActions from "../chat-actions-provider";

const ConversationScreen = () => {
  const dispatch = useAppDispatch();
  const chatActions = useChatActions();
  const conversationID = useParams<{ id: string }>().id;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => `${c.id}` == conversationID)
  );
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  if (!conversation) return <FullscreenLoader/>;

  const user = conversation.participants[0];
  return (
    <div className={classes.outer} data-testid='conversation-screen'>
      <TopBar>
        <Avatar
          src={user.photo?.small}
          alt='conversation-avatar'
          className={topBarClasses.leading}
        />
        <Typography variant='h6' className={topBarClasses.title}>
          {user.name ?? user.username}
        </Typography>
      </TopBar>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  }
});

export default ConversationScreen;