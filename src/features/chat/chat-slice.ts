import Conversation from "./types/conversation";
import ChatError from "./types/chat-error";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ThunkAPI} from "../../core/redux/store";
import {isRight} from "fp-ts/Either";
import {MESSAGES_PER_FETCH, SendMessageInput} from "./data/sources/chat-api";
import Message from "./types/message";
import {Media} from "./types/media";
import Typing, {TypingInput} from "./types/typing";

export type ChatState = {
  conversations: Conversation[] | null,
  typing: { [conversationID: number]: string[] }
  hasMore: { [conversationID: number]: boolean }
  // conversationID -> userID -> last seen messageID
  lastSeen: { [conversationID: number]: { [userID: string]: number } }
  error: ChatError | null,
}


export const initialChatState: ChatState = {
  conversations: null,
  typing: {},
  hasMore: {},
  lastSeen: {},
  error: null,
};

const getConversations = createAsyncThunk<Conversation[], void, ThunkAPI<ChatError>>(
  'chat/getConversations',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.chatRepo.getConversations();
    if (isRight(result)) {
      void thunkAPI.extra.chatRepo.messagesDelivered(result.right.map(c => c.id));
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const getOrCreateOTOConversation = createAsyncThunk<Conversation, string, ThunkAPI<ChatError>>(
  'chat/getOrCreateOTOConversation',
  async (userID, thunkAPI) => {
    const result = await thunkAPI.extra.chatRepo.getOrCreateOTOConversation(userID);
    if (isRight(result)) {
      void thunkAPI.extra.chatRepo.messagesDelivered([result.right.id]);
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const getMoreMessages = createAsyncThunk<Message[], number, ThunkAPI<ChatError>>(
  'chat/getMoreMessages',
  async (conversationID, thunkAPI) => {
    const firstMsgID = thunkAPI.getState().chat.conversations!
      .find(c => c.id == conversationID)!
      .messages[0].id;
    const result = await thunkAPI.extra.chatRepo
      .getMoreMessages(conversationID, firstMsgID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const typing = createAsyncThunk<void, TypingInput, ThunkAPI<ChatError>>(
  'chat/typing',
  (input, thunkAPI) => {
    void thunkAPI.extra.chatRepo.typing(input);
  }
);

const sendMessage = createAsyncThunk<Message, SendMessageInput & { tempID: number }, ThunkAPI<ChatError>>(
  'chat/sendMessage',
  async (input, thunkAPI) => {
    let medias: Media[] | undefined;
    if (input.medias) {
      medias = await Promise.all(
        input.medias.map(file => thunkAPI.extra.fileUtils.getMedia(file))
      );
    }
    const pendingMessage: Message = {
      id: input.tempID,
      senderID: thunkAPI.getState().me.me!.id,
      conversationID: input.conversationID,
      text: input.text,
      medias,
      sentAt: new Date().getTime(),
      deliveredTo: [],
      seenBy: [],
      sent: false
    };
    thunkAPI.dispatch(chatActions.appendMessage({message: pendingMessage}));
    const result = await thunkAPI.extra.chatRepo.sendMessage({
      conversationID: input.conversationID,
      text: input.text,
      medias: input.medias
    });
    if (isRight(result)) {
      setTimeout(() => {
        pendingMessage.medias?.forEach(thunkAPI.extra.fileUtils.freeMedia);
      }, 2000);
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const messagesSeen = createAsyncThunk<void, number, ThunkAPI<ChatError>>(
  'chat/messagesSeen',
  (convID, thunkAPI) => {
    const userID = thunkAPI.getState().me.me!.id;
    thunkAPI.dispatch(chatActions.recentMessagesSeen({convID, userID}));
    void thunkAPI.extra.chatRepo.messagesSeen(convID);
  }
);

let deliveryRequested = false;
let delivering = false;
const markAsDelivered = (mark: () => void) => {
  if (delivering) {
    deliveryRequested = true;
    return;
  }
  delivering = true;
  mark();
  setTimeout(() => {
    delivering = false;
    deliveryRequested = false;
    if (deliveryRequested) markAsDelivered(mark);
  }, 1000);
};
const subscribeToMessages = createAsyncThunk<void, void, ThunkAPI<ChatError>>(
  'chat/subscribeToMessages',
  async (_, thunkAPI) => {
    thunkAPI.extra.chatRepo.subscribeToMessages().subscribe((sub) => {
      const message = sub.message;
      const conv = thunkAPI.getState().chat.conversations?.find(conv => {
        return conv.id == message.conversationID;
      });
      if (!conv) {
        thunkAPI.dispatch(chatActions.getOrCreateOTOConversation(message.senderID));
        return;
      }
      const mine = thunkAPI.getState().me.me!.id == sub.message.senderID;
      setTimeout(() => {
        thunkAPI.dispatch(chatActions.appendMessage({
          message,
          update: sub.update || mine
        }));
      }, sub.update || mine ? 800 : 0);
      if (!mine) {
        markAsDelivered(() => thunkAPI.extra.chatRepo
          .messagesDelivered([message.conversationID]));
      }
    });
  }
);

const subscribeToTypings = createAsyncThunk<void, void, ThunkAPI<ChatError>>(
  'chat/subscribeToTypings',
  async (_, thunkAPI) => {
    thunkAPI.extra.chatRepo.subscribeToTypings().subscribe((typing) => {
      if (typing.started)
        thunkAPI.dispatch(chatActions.addTyping(typing));
      else
        thunkAPI.dispatch(chatActions.removeTyping(typing));
    });
  }
);

export const _handleRejected = (
  state: ChatState,
  action: PayloadAction<ChatError | undefined>
) => {
  state.error = action.payload == undefined
    ? ChatError.general
    : action.payload;
};

const setLastSeenAndHasMore = (state: ChatState, conv: Conversation) => {
  const messages = conv.messages;
  let userIDs: string[] = [];
  const lastSeen: { [userID: string]: number } = {};
  conv.participants.forEach(p => {
    userIDs.push(p.id);
    lastSeen[p.id] = -1;
  });
  let idx = messages.length - 1;
  while (idx >= 0 && userIDs.length) {
    const message = messages[idx];
    if (userIDs.indexOf(message.senderID) != -1) {
      userIDs = userIDs.filter(id => id != message.senderID);
      lastSeen[message.senderID] = message.id;
    }
    const sb = message.seenBy[0];
    if (sb && userIDs.indexOf(sb.userID) != -1) {
      userIDs = userIDs.filter(id => id != sb.userID);
      lastSeen[sb.userID] = message.id;
    }
    idx--;
  }
  state.lastSeen[conv.id] = lastSeen;
  state.hasMore[conv.id] = conv.messages.length >= MESSAGES_PER_FETCH;
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialChatState,
  reducers: {
    appendMessage(state: ChatState, action: PayloadAction<{ message: Message, update?: boolean }>) {
      const {message, update} = action.payload;
      const index = state.conversations!.findIndex(c => c.id == message.conversationID);
      if (update) {
        const conv = state.conversations![index];
        const mIndex = conv.messages.findIndex(m => m.id == message.id);
        const sb = message.seenBy[0];
        if (sb && state.lastSeen[conv.id][sb.userID] < message.id) {
          state.lastSeen[conv.id][sb.userID] = message.id;
        }
        if (mIndex != -1) {
          conv.messages[mIndex] = message;
          return;
        }
      }
      const conv = state.conversations!.splice(index, 1)[0];
      conv.messages.push(message);
      state.conversations?.unshift(conv);
      state.lastSeen[conv.id][message.senderID] = message.id;
    },
    addTyping(state: ChatState, action: PayloadAction<Typing>) {
      const {conversationID, userID} = action.payload;
      const typings = state.typing[conversationID];
      if (typings) {
        if (typings.indexOf(userID) == -1) typings.push(userID);
      } else {
        state.typing[conversationID] = [userID];
      }
    },
    removeTyping(state: ChatState, action: PayloadAction<Typing>) {
      const {conversationID, userID} = action.payload;
      const typings = state.typing[conversationID];
      if (typings) {
        state.typing[conversationID] = typings.filter(id => id != userID);
      }
    },
    recentMessagesSeen(
      state: ChatState,
      action: PayloadAction<{ convID: number, userID: string }>
    ) {
      const {convID, userID} = action.payload;
      const conv = state.conversations!.find(c => c.id == convID);
      const messages = conv!.messages;
      let idx = messages.length - 1;
      if (idx < 0) return;
      state.lastSeen[convID][userID] = messages[idx].id;
      while (idx >= 0 && messages[idx].senderID != userID && !messages[idx].seenBy[0]) {
        messages[idx].seenBy[0] = {userID, date: new Date().getTime(),};
        idx--;
      }
    }
  },
  extraReducers: builder => {
    // getConversations
    builder
      .addCase(getConversations.pending, state => {
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        action.payload.forEach(conv => {
          setLastSeenAndHasMore(state, conv);
        });
      })
      .addCase(getConversations.rejected, _handleRejected);
    // getOrCreateOTOConversation
    builder
      .addCase(getOrCreateOTOConversation.fulfilled, (state, action) => {
        const conv = action.payload;
        if (!state.conversations) {
          state.conversations = [conv];
          setLastSeenAndHasMore(state, conv);
        } else {
          const existing = state.conversations.find(c => c.id == conv.id);
          if (!existing) {
            state.conversations.unshift(conv);
            setLastSeenAndHasMore(state, conv);
          }
        }
      })
      .addCase(getOrCreateOTOConversation.rejected, _handleRejected);
    // getMoreMessages
    builder
      .addCase(getMoreMessages.fulfilled, (state, action) => {
        if (!action.payload) return;
        const convID = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == convID)!;
        const newMessages = action.payload;
        let userIDs: string[] = [];
        conv.participants.forEach(p => {
          if (state.lastSeen[convID][p.id] == -1)
            userIDs.push(p.id);
        });
        if (userIDs.length) {
          let idx = newMessages.length - 1;
          while (idx >= 0 && userIDs.length) {
            const msg = newMessages[idx];
            if (userIDs.indexOf(msg.senderID) != -1) {
              userIDs = userIDs.filter(id => id != msg.senderID);
              state.lastSeen[convID][msg.senderID] = msg.id;
            }
            const sb = msg.seenBy[0];
            if (sb && userIDs.indexOf(sb.userID) != -1) {
              userIDs = userIDs.filter(id => id != sb.userID);
              state.lastSeen[convID][sb.userID] = msg.id;
            }
            idx--;
          }
        }
        conv.messages = [...newMessages, ...conv.messages];
        state.hasMore[convID] = newMessages.length >= MESSAGES_PER_FETCH;
      });
    // sendMessage
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const {conversationID, tempID} = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == conversationID)!;
        const delivered = conv.messages.find(m => m.id == message.id);
        const messageIndex = conv.messages.findIndex(m => m.id == tempID);
        if (delivered) {
          conv.messages.splice(messageIndex, 1);
          return;
        }
        conv.messages[messageIndex] = message;
        state.lastSeen[conv.id][message.senderID] = message.id;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const {conversationID, tempID} = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == conversationID)!;
        const messageIndex = conv.messages.findIndex(m => m.id == tempID);
        conv.messages[messageIndex].error = true;
        if (action.payload == ChatError.blocked || action.payload == ChatError.blocking)
          conv.canChat = false;
      });
  }
});

export default chatSlice.reducer;

export const chatActions = {
  getConversations,
  getOrCreateOTOConversation,
  getMoreMessages,
  typing,
  sendMessage,
  messagesSeen,
  subscribeToMessages,
  subscribeToTypings,
  ...chatSlice.actions
};