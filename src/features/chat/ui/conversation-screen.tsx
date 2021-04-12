import React, {useCallback, useEffect, useState} from "react";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import useChatActions from "../chat-actions-provider";
import ChatTextField from "./components/chat-text-field";
import MessagesList from "./components/messages-list";
import {useDropzone} from "react-dropzone";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

const ConversationScreen = () => {
  // redux
  const dispatch = useAppDispatch();
  const chatActions = useChatActions();
  const me = useAppSelector(state => state.me.me);
  // Local state
  // is the current tab active? (used to decide if messages should be marked as seen)
  const [isActive, setIsActive] = useState(document.hasFocus());
  // Files picked to be sent in the chat
  const [files, setFiles] = useState<File[]>([]);
  // The current conversation
  // we get the id from the url params and get the actual conversation from the state
  const conversationID = useParams<{ id: string }>().id;
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => `${c.id}` == conversationID)
  );

  // Update [isActive] when needed
  useEffect(() => {
    window.onblur = () => setIsActive(false);
    window.onfocus = () => setIsActive(true);
  }, []);

  // Mark messages as seen whenever [isActive] changes to true
  useEffect(() => {
    if (isActive) {
      dispatch(chatActions.messagesSeen(Number(conversationID)));
    }
  }, [isActive]);

  // Callback for when a picked file is removed
  const fileRemoved = useCallback((index: number) => {
    setFiles(files => files.filter((_, i) => i != index));
  }, []);

  // Callback for when the user sends the message
  const submit = useCallback((text: string) => {
    // Remove leading/trailing whitespaces from the message text
    const msgText = text.trim();
    // Don't send the message if the text is empty after trimming it
    // TODO: The message can be sent if there are files, even if the text is empty
    if (!msgText) return;
    // Send a message if the text is not empty
    dispatch(chatActions.sendMessage({
      conversationID: Number(conversationID),
      tempID: new Date().getTime(),
      text: msgText,
    }));
  }, [conversationID]);

  // Callback for when a file is picked
  const onDrop = useCallback((newFiles: File[]) => {
    if (newFiles.length) {
      setFiles(files => [...files, ...newFiles]);
    }
  }, []);

  // React dropzone stuff
  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    accept: 'image/*,video/*',
    noClick: true,
    noKeyboard: true,
  });

  // CSS
  const classes = useStyles({isDragActive});
  const topBarClasses = useTopBarStyles();

  if (!conversation) return <FullscreenLoader/>;

  const otherUser = conversation.participants[0];
  const rootProps = getRootProps({
    className: classes.outer,
    'data-testid': 'conversation-screen'
  });
  const inputProps = getInputProps();
  return (
    <div {...rootProps} >
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
      <ChatTextField
        files={files}
        fileRemoved={fileRemoved}
        submit={submit}
        addFileClicked={open}
      />
      <div className={classes.dragIndicator}>
        Drop files here
      </div>
      <input {...inputProps}/>
    </div>
  );
};

const useStyles = makeStyles<Theme, { isDragActive: boolean }>({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    paddingTop: '56px',
  },
  dragIndicator: props => {
    let opacity: number;
    let display: string;
    if (props.isDragActive) {
      opacity = 0.8;
      display = 'flex';
    } else {
      opacity = 0;
      display = 'none';
    }
    return {
      display,
      opacity,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      width: '100%',
      height: '100%',
      color: 'black',
      background: 'white',
    };
  }
});

export default ConversationScreen;