import Conversation from "./types/conversation";
import ChatError from "./types/chat-error";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ThunkAPI} from "../../store/store";
import {isRight} from "fp-ts/Either";
import {SendMessageInput} from "./data/sources/chat-api";
import Message from "./types/message";
import {Media, MediaType} from "./types/media";

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
    const result = await thunkAPI.extra.chatRepo.sendMessage(input);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const _handleRejected = (
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
  reducers: {},
  extraReducers: builder => {
    // getConversations
    builder
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
      .addCase(sendMessage.pending, (state, action) => {
        const input = action.meta.arg;
        const pendingMessage: Message = {
          id: input.tempID,
          senderID: 'pending',
          conversationID: input.conversationID,
          text: input.text,
          medias: input.medias?.map(_getMedia),
          sentAt: new Date().getTime(),
          deliveredTo: [],
          seenBy: [],
          sent: false
        };
        for (let i in state.conversations!) {
          if (state.conversations[i].id == input.conversationID) {
            state.conversations[i].messages = [
              pendingMessage, ...state.conversations[i].messages
            ];
            break;
          }
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const {conversationID, tempID} = action.meta.arg;
        for (let i in state.conversations!) {
          if (state.conversations[i].id == conversationID) {
            for (let j in state.conversations[i].messages) {
              if (state.conversations[i].messages[j].id == tempID) {
                state.conversations[i].messages[j] = action.payload;
                break;
              }
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const {conversationID, tempID} = action.meta.arg;
        for (let i in state.conversations!) {
          if (state.conversations[i].id == conversationID) {
            for (let j in state.conversations[i].messages) {
              if (state.conversations[i].messages[j].id == tempID) {
                state.conversations[i].messages[j] = {
                  ...state.conversations[i].messages[j],
                  error: true
                };
                break;
              }
            }
          }
        }
      });
  }
});

const _getMedia = (file: File): Media => {
  const ext = file.name.split('.').pop();
  const imageExt = ['png', 'jpg', 'jpeg'];
  if (imageExt.indexOf(ext!) != -1) {
    return {
      url: URL.createObjectURL(file),
      type: MediaType.IMAGE
    };
  }
  if (ext == 'mp4') {
    return {
      url: URL.createObjectURL(file),
      type: MediaType.VIDEO
    };
  }
  throw new Error('Unsupported file type');
};

export default chatSlice.reducer;

export const chatActions = {
  ...chatSlice.actions
};