import React from "react";
import {makeStyles} from "@material-ui/core";
import Message from "../../types/message";

export type MessagesListProps = {
  messages: Message[]
}

const MessagesList = (props: MessagesListProps) => {
  const classes = useStyles();

  const messages = [...props.messages].reverse();
  const lis = messages.map(m => <li>{m.text}</li>);
  return (
    <div className={classes.outer}>
      <ol>
        {lis}
      </ol>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    flexGrow: 1,
    background: 'red',
    overflowY: 'auto',
  },
  inner: {
    height: '1000px',
    background: 'blue'
  }
});

export default MessagesList;