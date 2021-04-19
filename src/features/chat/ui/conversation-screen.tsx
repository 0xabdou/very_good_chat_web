import React, {useCallback, useEffect, useState} from "react";
import {ButtonBase, makeStyles, Typography} from "@material-ui/core";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import {useHistory, useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../core/redux/hooks";
import FullscreenLoader from "../../../shared/components/fullscreen-loader";
import useChatActions from "../chat-actions-provider";
import ChatTextField from "./components/chat-text-field";
import MessagesList from "./components/messages-list";
import {useDropzone} from "react-dropzone";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {ErrorSnackbar} from "../../../shared/components/snackbars";
import FriendAvatar from "../../friend/ui/components/friend-avatar";

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
  // File errors
  const [fileError, setFileError] = useState<CustomError | null>(null);
  // The current conversation
  // we get the id from the url params and get the actual conversation from the state
  const conversationID = Number(useParams<{ id: string }>().id);
  const conversation = useAppSelector(
    state => state.chat.conversations?.find(c => c.id == conversationID)
  );
  // The friend object of the other side of the conversation
  const friend = useAppSelector(
    state => state.friends.friends?.find(f => f.user.id == conversation?.participants[0].id)
  );
  // Is the other side currently typing?
  const typing: boolean = useAppSelector(state => {
    const userID = conversation?.participants[0]?.id;
    if (!userID) return false;
    const typings = state.chat.typing[conversationID];
    if (!typings) return false;
    return typings.indexOf(userID) != -1;
  });
  // does the conversation have more messages to fetch
  const hasMore: boolean = useAppSelector(state => {
    return state.chat.hasMore[conversationID];
  });
  // Last seen messages
  const lastSeen = useAppSelector(state => {
    return state.chat.lastSeen[conversationID];
  });
  // Navigation stuff
  const history = useHistory();
  // The other side of the conversation
  const otherUser = conversation?.participants[0];

  // Update [isActive] when needed
  useEffect(() => {
    window.onblur = () => setIsActive(false);
    window.onfocus = () => setIsActive(true);
    return () => {
      window.onblur = null;
      window.onfocus = null;
    };
  }, []);

  // Mark messages as seen whenever [isActive] changes to true
  useEffect(() => {
    if (isActive) {
      dispatch(chatActions.messagesSeen(Number(conversationID)));
    }
  }, [isActive, conversationID]);

  // Callback for when a picked file is removed
  const fileRemoved = useCallback((index: number) => {
    setFiles(files => files.filter((_, i) => i != index));
  }, []);

  // Callback for when a file is picked
  const onDrop = useCallback((newFiles: File[]) => {
    if (newFiles.length) {
      setFiles(files => {
        const allFiles = [...files, ...newFiles];
        if (allFiles.length > 10) {
          setFileError(error => ({
            message: "You can't send more than 10 files",
            pleaseRerender: (error?.pleaseRerender ?? 0) + 1,
          }));
          return files;
        }
        const totalSize = allFiles.reduce((size: number, file) => size + file.size, 0);
        if (totalSize > 25000000) {
          setFileError(error => ({
            message: "You can't send more than 25mb",
            pleaseRerender: (error?.pleaseRerender ?? 0) + 1,
          }));
          return files;
        }
        return allFiles;
      });
    }
  }, []);

  // Callback for when the user sends the message
  const submit = useCallback((text: string) => {
    // Remove leading/trailing whitespaces from the message text
    const msgText = text.trim();
    // Don't send the message if the text is empty after trimming it
    if (!msgText && !files.length) return;
    // Send a message if the text is not empty
    dispatch(chatActions.sendMessage({
      conversationID: Number(conversationID),
      tempID: new Date().getTime(),
      text: msgText ?? undefined,
      medias: files.length ? files : undefined
    }));
    setFiles([]);
  }, [conversationID, files]);

  // Identity function for error snackbar
  const stringifyCustomError = useCallback(
    (error: CustomError | null) => error?.message ?? '', []
  );

  // Callback for when the avatar/name on the top bar is clicked
  const goToProfile = useCallback(() => {
    if (otherUser) history.push(`/u/${otherUser.username}`);
  }, [history]);

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

  const rootProps = getRootProps({
    className: classes.outer,
    'data-testid': 'conversation-screen'
  });
  const inputProps = getInputProps();
  return (
    <div {...rootProps} >
      <TopBar>
        <ButtonBase onClick={goToProfile}>
          <FriendAvatar src={otherUser?.photo?.small}
                        lastSeen={friend?.lastSeen}/>
          <div className={classes.title}>
            <Typography variant='h6' className={topBarClasses.title}>
              {otherUser?.name ?? otherUser?.username}
            </Typography>
          </div>
        </ButtonBase>
      </TopBar>
      <MessagesList
        conversation={conversation}
        currentUserID={me?.id ?? ''}
        typing={typing}
        hasMore={hasMore}
        lastSeen={lastSeen}
      />
      {
        conversation.canChat &&
        <ChatTextField
          conversationID={conversationID}
          files={files}
          fileRemoved={fileRemoved}
          submit={submit}
          addFileClicked={open}
        />
      }
      {
        !conversation.canChat &&
        <div className={classes.cannotChat}>
          You can't reply to this conversation
        </div>
      }
      <div className={classes.dragIndicator}>
        Drop files here
      </div>
      <input {...inputProps}/>
      <ErrorSnackbar<CustomError>
        currentError={fileError}
        stringify={stringifyCustomError}
      />
    </div>
  );
};

type CustomError = { message: string, pleaseRerender: number }

const useStyles = makeStyles<Theme, { isDragActive: boolean }>({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    paddingTop: '64px',
    background: "white",
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  lastSeen: {
    color: "black",
    fontSize: '0.8rem',
    textTransform: "uppercase"
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
  },
  cannotChat: {
    display: "flex",
    justifyContent: "center",
    fontSize: "0.8rem",
    padding: "16px",
  }
});

export default ConversationScreen;