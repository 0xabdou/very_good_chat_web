import Conversation from "./types/conversation";
import ChatError from "./types/chat-error";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ThunkAPI} from "../../store/store";
import {isRight} from "fp-ts/Either";
import {SendMessageInput} from "./data/sources/chat-api";
import Message from "./types/message";
import {Media} from "./types/media";

export type ChatState = {
  conversations: Conversation[] | null,
  error: ChatError | null,
}

export const initialChatState: ChatState = {
  conversations: null,
  error: null,
};

const getConversations = createAsyncThunk<Conversation[], void, ThunkAPI<ChatError>>(
  'chat/getConversations',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.chatRepo.getConversations();
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const getOrCreateOTOConversation = createAsyncThunk<Conversation, string, ThunkAPI<ChatError>>(
  'chat/getOrCreateOTOConversation',
  async (userID, thunkAPI) => {
    const result = await thunkAPI.extra.chatRepo.getOrCreateOTOConversation(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
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
      senderID: 'pending',
      conversationID: input.conversationID,
      text: input.text,
      medias,
      sentAt: new Date().getTime(),
      deliveredTo: [],
      seenBy: [],
      sent: false
    };
    thunkAPI.dispatch(chatActions.messagePending(pendingMessage));
    const result = await thunkAPI.extra.chatRepo.sendMessage({
      conversationID: input.conversationID,
      text: input.text,
      medias: input.medias
    });
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
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
    messagePending(state: ChatState, action: PayloadAction<Message>) {
      const pendingMessage = action.payload;
      const index = state.conversations!.findIndex(c => c.id == pendingMessage.conversationID);
      const conv = state.conversations!.splice(index, 1)[0];
      conv.messages.push(pendingMessage);
      state.conversations?.unshift(conv);
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
        console.log(conversationID);
        console.log(state.conversations);
        const conv = state.conversations!.find(c => c.id == conversationID)!;
        const messageIndex = conv.messages.findIndex(m => m.id == tempID);
        conv.messages[messageIndex].error = true;
      });
  }
});

export default chatSlice.reducer;

export const chatActions = {
  getConversations,
  getOrCreateOTOConversation,
  sendMessage,
  ...chatSlice.actions
};