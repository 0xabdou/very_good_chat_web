import React, {useCallback, useRef} from "react";
import {makeStyles} from "@material-ui/core";
import Message from "../../types/message";
import AutoSizer from "react-virtualized-auto-sizer";
import {VariableSizeList} from "react-window";
import MessageListItem from "./message-list-item";

export type MessagesListProps = {
  messages: Message[],
  currentUserID?: string,
}

type Heights = { [index: number]: number }

const MessagesList = (props: MessagesListProps) => {
  const classes = useStyles();
  const heights = useRef<Heights>({});
  const listRef = useRef<VariableSizeList>(null);

  const setHeight = useCallback((index: number, height: number) => {
    heights.current[index] = height;
    listRef?.current?.resetAfterIndex(0);
  }, [listRef, heights]);

  const itemKey = useCallback((index: number, data: Message[]) => {
    return data[index].id;
  }, []);

  const itemSize = useCallback((index: number): number => {
    return heights.current[index] ?? 72;
  }, [heights]);

  const messages = [...props.messages].reverse();
  return (
    <div className={classes.outer}>
      <AutoSizer>
        {({height, width}) => {
          return <VariableSizeList
            itemCount={messages.length}
            itemData={messages}
            itemKey={itemKey}
            itemSize={itemSize}
            overscanCount={3}
            height={height}
            width={width}
            ref={listRef}
          >
            {({index, style, data}) => {
              return (
                <MessageListItem
                  style={style}
                  message={data[index]}
                  incoming={data[index].senderID != props.currentUserID}
                  index={index}
                  setHeight={setHeight}
                />
              );
            }}
          </VariableSizeList>;
        }}
      </AutoSizer>
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    flexGrow: 1,
    overflowY: 'auto',
  },
});

export default MessagesList;