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
  typings: { [conversationID: number]: string[] }
  error: ChatError | null,
}

export const initialChatState: ChatState = {
  conversations: null,
  typings: {},
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
    const conv = thunkAPI.getState().chat.conversations?.find(c => c.id == conversationID);
    if (!conv) return [];
    const firstMsgID = conv.messages[0].id;
    const result = await thunkAPI.extra.chatRepo.getMoreMessages(conversationID, firstMsgID);
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

const subscribeToMessages = createAsyncThunk<void, void, ThunkAPI<ChatError>>(
  'chat/subscribeToMessages',
  async (_, thunkAPI) => {
    thunkAPI.extra.chatRepo.subscribeToMessages().subscribe((sub) => {
      const mine = thunkAPI.getState().me.me!.id == sub.message.senderID;
      const message = sub.message;
      if (sub.update) {
        thunkAPI.dispatch(chatActions.updateMessage({message, mine}));
      } else {
        thunkAPI.dispatch(chatActions.appendMessage({message, mine}));
        thunkAPI.extra.chatRepo.messagesDelivered([message.conversationID]);
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

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialChatState,
  reducers: {
    appendMessage(state: ChatState, action: PayloadAction<{ message: Message, mine?: boolean }>) {
      const {message, mine} = action.payload;
      const index = state.conversations!.findIndex(c => c.id == message.conversationID);
      const conv = state.conversations!.splice(index, 1)[0];
      if (!mine) {
        if ((conv.seenDates[message.senderID] ?? 0) < message.sentAt)
          conv.seenDates[message.senderID] = message.sentAt;
      }
      conv.messages.push(message);
      state.conversations?.unshift(conv);
    },
    updateMessage(state: ChatState, action: PayloadAction<{ message: Message, mine?: boolean }>) {
      const {message, mine} = action.payload;
      const conv = state.conversations!.find(c => c.id == message.conversationID);
      if (!conv) return;
      const mIndex = conv.messages.findIndex(m => m.id == message.id);
      conv.messages.splice(mIndex, 1, message);
      if (mine && message.seenBy[0]) {
        const sb = message.seenBy[0];
        if (conv.seenDates[sb.userID] < sb.date)
          conv.seenDates[sb.userID] = sb.date;
      }
    },
    addTyping(state: ChatState, action: PayloadAction<Typing>) {
      const {conversationID, userID} = action.payload;
      const typings = state.typings[conversationID];
      if (typings) {
        if (typings.indexOf(userID) == -1) typings.push(userID);
      } else {
        state.typings[conversationID] = [userID];
      }
    },
    removeTyping(state: ChatState, action: PayloadAction<Typing>) {
      const {conversationID, userID} = action.payload;
      const typings = state.typings[conversationID];
      if (typings) {
        state.typings[conversationID] = typings.filter(id => id != userID);
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
      while (!messages[idx].seenBy[0] && idx >= 0) {
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
      })
      .addCase(getConversations.rejected, _handleRejected);
    // getOrCreateOTOConversation
    builder
      .addCase(getOrCreateOTOConversation.fulfilled, (state, action) => {
        if (!state.conversations) {
          state.conversations = [action.payload];
        } else {
          let pushed = false;
          for (let i in state.conversations) {
            if (state.conversations[i].id == action.payload.id) {
              state.conversations[i] = action.payload;
              pushed = true;
              break;
            }
          }
          if (!pushed) state.conversations.push(action.payload);
        }
      })
      .addCase(getOrCreateOTOConversation.rejected, _handleRejected);
    // getMoreMessages
    builder
      .addCase(getMoreMessages.pending, (state, action) => {
        const convID = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == convID)!;
        conv.fetchingMore = true;
      })
      .addCase(getMoreMessages.fulfilled, (state, action) => {
        const convID = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == convID)!;
        const newMessages = action.payload;
        conv.hasMore = newMessages.length >= MESSAGES_PER_FETCH;
        conv.messages = [...newMessages, ...conv.messages];
        conv.fetchingMore = false;
      })
      .addCase(getMoreMessages.rejected, (state, action) => {
        const convID = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == convID)!;
        conv.fetchingMore = false;
      });
    // sendMessage
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const {conversationID, tempID} = action.meta.arg;
        const conv = state.conversations!.find(c => c.id == conversationID)!;
        const messageIndex = conv.messages.findIndex(m => m.id == tempID);
        conv.messages[messageIndex] = action.payload;
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