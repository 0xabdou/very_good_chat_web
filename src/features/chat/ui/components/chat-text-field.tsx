import 'emoji-mart/css/emoji-mart.css';

import React, {
  ChangeEvent,
  KeyboardEventHandler,
  useCallback,
  useState
} from "react";
import {
  Icon,
  IconButton,
  makeStyles,
  Popover,
  TextareaAutosize
} from "@material-ui/core";
import {useAppDispatch} from "../../../../core/redux/hooks";
import useChatActions from "../../chat-actions-provider";
import {BaseEmoji, Picker} from "emoji-mart";

export type ChatTextFieldProps = {
  conversationID: number,
}

const ChatTextField = (props: ChatTextFieldProps) => {
  const dispatch = useAppDispatch();
  const actions = useChatActions();
  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();

  // text input stuff
  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const onKeyPress: KeyboardEventHandler = useCallback((e) => {
    if (e.code == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enterPressed();
    }
  }, [text]);

  const enterPressed = () => {
    const msgText = text.trim();
    if (!msgText) return;
    dispatch(actions.sendMessage({
      conversationID: props.conversationID,
      tempID: new Date().getTime(),
      text: msgText,
    }));
    setText('');
  };

  // Emoji picker stuff
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const onSelect = useCallback((data: BaseEmoji) => {
    setText(t => `${t} ${data.native}`);
  }, []);

  return (
    <div className={classes.wrapper} data-testid='chat-text-field'>
      <IconButton
        className={`${classes.button} ${classes.addButton}`}
        onClick={() => null}
      >
        <Icon className={classes.buttonIcon}>add_circle</Icon>
      </IconButton>
      <div className={classes.innerWrapper}>
        <TextareaAutosize
          className={classes.textArea}
          value={text}
          onChange={onChange}
          onKeyPress={onKeyPress}
          rowsMax='5'
          placeholder='Aa'
        />
        <IconButton
          className={`${classes.button} ${classes.smileButton}`}
          aria-controls="emojis"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <Icon className={classes.buttonIcon}>emoji_emotions</Icon>
        </IconButton>
      </div>
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

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    padding: '0.5rem'
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
  addButton: {
    marginRight: '0.5rem'
  },
  smileButton: {
    margin: '5px',
  },
  button: {
    height: '25px',
    width: '25px',
  },
  buttonIcon: {
    color: 'black',
  }
});

export default ChatTextField;