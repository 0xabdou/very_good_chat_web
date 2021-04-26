import 'emoji-mart/css/emoji-mart.css';

import React, {
  ChangeEvent,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  Icon,
  IconButton,
  makeStyles,
  Popover,
  TextareaAutosize
} from "@material-ui/core";
import {BaseEmoji, Picker} from "emoji-mart";
import MediaPreview from "./media-preview";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {useAppDispatch, useAppSelector} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";

export type ChatTextFieldProps = {
  conversationID: number,
  files: File[],
  fileRemoved: (index: number) => void,
  submit: (text: string) => void,
  addFileClicked: () => void,
  filesPasted: (files: File[]) => void,
}

const ChatTextField = (props: ChatTextFieldProps) => {
  const canChat = useAppSelector(state => {
    return state.chat.conversations?.find(c => c.id == props.conversationID)
      ?.canChat;
  });
  const dispatch = useAppDispatch();
  const {typing} = useChatActions();
  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const classes = useStyles({typing: text.length > 0 || props.files.length > 0});

  const submit = useCallback(() => {
    props.submit(text);
    setText('');
  }, [text, props.submit]);

  useEffect(() => {
    if (sendButtonRef.current) {
      sendButtonRef.current.ontouchend = (e) => {
        e.preventDefault();
        console.log(e);
        submit();
      };
      sendButtonRef.current.onmouseup = (e) => {
        e.preventDefault();
        console.log(e);
        submit();
      };
    }
    return () => {
      if (sendButtonRef.current) {
        sendButtonRef.current.ontouchend = null;
        sendButtonRef.current.onmouseup = null;
      }
    };
  }, [sendButtonRef.current, submit]);


  // text input stuff
  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!timer.current) {
      dispatch(typing({conversationID: props.conversationID, started: true}));
    } else {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      dispatch(typing({
        conversationID: props.conversationID,
        started: false
      }));
      timer.current = null;
    }, 3000);

  }, []);
  const onKeyPress: KeyboardEventHandler = useCallback((e) => {
    if (e.code == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
      dispatch(typing({conversationID: props.conversationID, started: false}));
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    }
  }, [text, props.submit]);

  // Emoji picker stuff
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const onSelect = useCallback((data: BaseEmoji) => {
    setText(text => `${text}${data.native}`);
  }, []);

  //
  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.files;
    if (pasted.length) {
      const files: File[] = [];
      for (let i = 0; i < pasted.length; i++)
        files.push(pasted.item(i)!);
      props.filesPasted(files);
    }
  }, [props.filesPasted]);

  const mediaPreviews = props.files.map((f, i) => {
    return (
      <MediaPreview
        file={f}
        index={i}
        onClear={props.fileRemoved}
        key={i}
      />
    );
  });
  if (canChat == undefined) return <div/>;
  if (!canChat) {
    return (
      <div className={classes.cannotChat}>
        You can't reply to this conversation
      </div>
    );
  }
  return (
    <div className={classes.wrapper} data-testid='chat-text-field'>
      {/* The add button at the right of the text field (for picking files) */}
      <IconButton
        className={`${classes.button} ${classes.leftButton}`}
        onClick={props.addFileClicked}
      >
        <Icon className={classes.buttonIcon}>add_circle</Icon>
      </IconButton>
      {/* This groups the text field, the emojis button, and the media previews */}
      <div className={classes.middleWrapper}>
        {/* If the are some files, the previews will be displayed on top of the text field */}
        {
          !!mediaPreviews.length &&
          <div className={classes.mediaPreviews}>{mediaPreviews}</div>
        }
        {/* This groups the text field and the emojis button */}
        <div className={classes.innerWrapper}>
          <TextareaAutosize
            className={classes.textArea}
            value={text}
            onChange={onChange}
            onKeyPress={onKeyPress}
            rowsMax='5'
            placeholder='Aa'
            onPaste={onPaste}
          />
          <IconButton
            className={`${classes.button} ${classes.rightButton}`}
            aria-controls="emojis"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <Icon className={classes.buttonIcon}>emoji_emotions</Icon>
          </IconButton>
        </div>
      </div>
      <IconButton
        className={`${classes.button} ${classes.rightButton} ${classes.sendButton}`}
        ref={sendButtonRef}
      >
        <Icon className={classes.buttonIcon}>send</Icon>
      </IconButton>
      {/* This is a popover that contains the emoji picker, shown when the user
      clicks on the emoji button*/}
      <Popover
        id="emojis"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {/* This is the actual emoji picker */}
        <Picker
          showPreview={false}
          showSkinTones={false}
          onSelect={onSelect}
          native={true}
        />
      </Popover>
    </div>
  );
};

const useStyles = makeStyles<Theme, { typing: boolean }>({
  wrapper: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    padding: '0.5rem'
  },
  middleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F3F3F5',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  innerWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    backgroundColor: '#F3F3F5',
    borderRadius: '16px',
  },
  textArea: {
    outline: 'none',
    border: 'none',
    padding: '8px 14px',
    backgroundColor: '#F3F3F5',
    borderRadius: '16px',
    resize: 'none',
    fontStyle: 'normal',
    fontSize: '1rem',
    fontFamily: 'inherit',
    textTransform: 'full-width',
    display: 'inline-flex',
    lineHeight: '1',
    flexGrow: 1,
  },
  leftButton: {
    marginRight: '0.5rem'
  },
  rightButton: {
    margin: '5px',
  },
  sendButton: props => {
    const value = props.typing ? undefined : 0;
    return ({
      width: value,
      height: value,
      padding: value,
      margin: value,
      transform: props.typing ? "scale(1)" : "scale(0)",
      transition: "200ms",
    });
  },
  button: {
    height: '25px',
    width: '25px',
  },
  buttonIcon: {
    color: 'black',
  },
  mediaPreviews: {
    display: 'flex',
    width: '100%',
    background: "#F3F3F5",
    borderRadius: '16px',
    padding: "4px 8px",
    overflowY: 'hidden',
    overflowX: 'auto'
  },
  cannotChat: {
    display: "flex",
    justifyContent: "center",
    fontSize: "0.8rem",
    padding: "16px",
  }
});

export default ChatTextField;