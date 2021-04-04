import React, {ChangeEvent, FormEvent, useCallback, useState} from "react";
import {Icon, IconButton, makeStyles, TextField} from "@material-ui/core";
import {useAppDispatch} from "../../../../store/hooks";
import useChatActions from "../../chat-actions-provider";

export type ChatTextFieldProps = {
  conversationID: number,
}

const ChatTextField = (props: ChatTextFieldProps) => {
  const dispatch = useAppDispatch();
  const actions = useChatActions();
  const [text, setText] = useState('');
  const classes = useStyles();

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(actions.sendMessage({
      conversationID: props.conversationID,
      tempID: new Date().getTime(),
      text,
    }));
    setText('');
  }, [text]);

  return (
    <div className={classes.wrapper} data-testid='chat-text-field'>
      <IconButton>
        <Icon>add</Icon>
      </IconButton>
      <form onSubmit={onSubmit}>
        <TextField
          value={text}
          onChange={onChange}
          placeholder='Aa'/>
      </form>

    </div>
  );
};

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    width: '100%',
  },
});

export default ChatTextField;