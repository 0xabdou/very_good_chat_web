import React, {useContext} from 'react';
import {chatActions} from "./chat-slice";

export const ChatActionsContext = React.createContext(chatActions);

const useChatActions = () => useContext(ChatActionsContext);

export default useChatActions;