import React, {useEffect, useRef} from "react";
import Message from "../../types/message";
import {makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";

export type MessageListItemProps = {
  message: Message,
  incoming: boolean,
  index: number,
  setHeight: (index: number, height: number) => void,
  style?: React.CSSProperties
};

const MessageListItem = (props: MessageListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const classes = useStyles({incoming: props.incoming});

  useEffect(() => {
    const height = ref.current?.clientHeight ?? 72;
    console.log('CURRENT height: ', ref?.current?.clientHeight);
    props.setHeight(props.index, height);
  }, [ref.current, props.setHeight, props.index]);

  return (
    <div
      style={props.style}
      data-testid='message-list-item'
    >
      <div className={classes.wrapper} ref={ref}>
        <div className={classes.bubble}>
          {props.message.text}
        </div>
      </div>
    </div>
  );
};

type MessageListStyleProps = {
  incoming: boolean,
}

const useStyles = makeStyles<Theme, MessageListStyleProps>({
  wrapper: props => ({
    display: 'flex',
    justifyContent: props.incoming ? 'flex-start' : 'flex-end',
  }),
  bubble: props => {
    let background, color: string;
    if (props.incoming) {
      background = 'grey';
      color = 'black';
    } else {
      background = 'black';
      color = 'white';
    }
    return {
      padding: '12px 8px',
      borderRadius: '18px',
      background,
      color
    };
  },
});

export default MessageListItem;