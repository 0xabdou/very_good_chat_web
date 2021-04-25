import {IconButton} from "@material-ui/core";
import React, {useCallback, useState} from "react";
import User from "../../../user/types/user";
import {useAppDispatch} from "../../../../core/redux/hooks";
import useChatActions from "../../../chat/chat-actions-provider";
import {useHistory} from "react-router-dom";
import {useStore} from "react-redux";
import {AppState} from "../../../../core/redux/store";
import {ConversationType} from "../../../../_generated/globalTypes";
import Conversation from "../../../chat/types/conversation";
import {useFriendProfileButtonStyles} from "../friend-profile-screen";

export type ChatButtonProps = {
  user: User
};

const ChatButton = (props: ChatButtonProps) => {
  const store = useStore<AppState>();
  const dispatch = useAppDispatch();
  const chatActions = useChatActions();
  const history = useHistory();
  const [disabled, setDisabled] = useState(false);
  const classes = useFriendProfileButtonStyles({block: false});

  const getConvThenNavigate = async () => {
    setDisabled(true);
    const result = await dispatch(chatActions.getOrCreateOTOConversation(props.user.id));
    if (result.meta.requestStatus == 'fulfilled') {
      const conv = result.payload as Conversation;
      history.push(`/c/${conv.id}`, {canGoBack: true});
    }
    setDisabled(false);
  };

  const onTap = useCallback(() => {
    console.log(store.getState());
    const conv = store.getState().chat.conversations?.find(c => {
      if (c.type == ConversationType.ONE_TO_ONE) {
        const u = c.participants.find(p => p.id == props.user.id);
        if (u) return true;
      }
      return false;
    });
    if (conv) history.push(`/c/${conv.id}`, {canGoBack: true});
    else void getConvThenNavigate();
  }, [props.user]);

  return (
    <div className={`${classes.wrapper} ${classes.marginLeft}`}>
      <IconButton
        className={classes.button}
        onClick={onTap}
        disabled={disabled}
        data-testid='chat-button'
      >
        <i className='fas fa-feather'/>
      </IconButton>
      <span className={classes.label}>Send message</span>
    </div>
  );
};

export default ChatButton;