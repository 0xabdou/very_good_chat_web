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
import {BaseEmoji, Picker} from "emoji-mart";
import MediaPreview from "./media-preview";

export type ChatTextFieldProps = {
  files: File[],
  fileRemoved: (index: number) => void,
  submit: (text: string) => void,
  addFileClicked: () => void,
}

const ChatTextField = (props: ChatTextFieldProps) => {
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
      props.submit(text);
      setText('');
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
  return (
    <div className={classes.wrapper} data-testid='chat-text-field'>
      {/* The add button at the right of the text field (for picking files) */}
      <IconButton
        className={`${classes.button} ${classes.addButton}`}
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
      </div>
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

const useStyles = makeStyles({
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
  },
  mediaPreviews: {
    display: 'flex',
    width: '100%',
    background: "#F3F3F5",
    borderRadius: '16px',
    padding: "4px 8px",
    overflowY: 'hidden',
    overflowX: 'auto'
  }
});

export default ChatTextField;