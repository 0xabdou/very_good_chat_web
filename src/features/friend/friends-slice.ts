import {FriendRequests} from "./types/friend-request";
import FriendError from "./types/friend-error";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ThunkAPI} from "../../store/store";
import {isRight} from "fp-ts/Either";

export type FriendsState = {
  friendRequests: FriendRequests | null,
  beingTreated: string[],
  error: FriendError | null
}

export const initialFriendsState: FriendsState = {
  friendRequests: null,
  beingTreated: [],
  error: null
};

let _pollingTimer: NodeJS.Timeout;

const getFriendRequests = createAsyncThunk<FriendRequests, void, ThunkAPI<FriendError>>(
  'friends/getFriendRequests',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.friendRepo.getFriendRequests();
    if (isRight(result)) {
      if (!_pollingTimer)
        _pollingTimer = setInterval(() => {
          thunkAPI.dispatch(getFriendRequests());
        }, 5000);
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const acceptFriendRequest = createAsyncThunk<string, string, ThunkAPI<FriendError>>(
  'friends/accept',
  async (userID, thunkAPI) => {
    const result = await thunkAPI.extra.friendRepo.acceptFriendRequest(userID);
    if (isRight(result)) return userID;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const declineFriendRequest = createAsyncThunk<string, string, ThunkAPI<FriendError>>(
  'friends/decline',
  async (userID, thunkAPI) => {
    const result = await thunkAPI.extra.friendRepo.declineFriendRequest(userID);
    if (isRight(result)) return userID;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const cancelFriendRequest = createAsyncThunk<string, string, ThunkAPI<FriendError>>(
  'friends/cancel',
  async (userID, thunkAPI) => {
    const result = await thunkAPI.extra.friendRepo.cancelFriendRequest(userID);
    if (isRight(result)) return userID;
    return thunkAPI.rejectWithValue(result.left);
  }
);

export const _handleRejected = (
  state: FriendsState,
  action: PayloadAction<FriendError | undefined>
) => {
  if (action.payload == undefined) state.error = FriendError.general;
  else state.error = action.payload;
};

export const _handleRequestPending = (
  state: FriendsState,
  action: PayloadAction<void, string, { arg: string }>
) => {
  state.beingTreated = [...state.beingTreated, action.meta.arg];
  state.error = null;
};

export const _handleRequestFulfilled = (
  state: FriendsState,
  action: PayloadAction<string, string, { arg: string }>
) => {
  const userID = action.meta.arg;
  state.beingTreated = state.beingTreated.filter(id => id != userID);
  removeRequest(state, action.meta.arg);
};

export const _handleRequestRejected = (
  state: FriendsState,
  action: PayloadAction<FriendError | undefined, string, { arg: string }>
) => {
  const error = action.payload == undefined
    ? FriendError.general
    : action.payload;
  const userID = action.meta.arg;
  state.error = error;
  state.beingTreated = state.beingTreated.filter(id => id != userID);
  if (error == FriendError.requestRemoved || error == FriendError.alreadyFriends) {
    removeRequest(state, userID);
  }
};

const removeRequest = (state: FriendsState, userID: string) => {
  const {sent, received} = state.friendRequests!;
  state.friendRequests = {
    sent: sent.filter(r => r.user.id != userID),
    received: received.filter(r => r.user.id != userID),
  };
};

const friendsSlice = createSlice({
  name: 'friends',
  initialState: initialFriendsState,
  reducers: {},
  extraReducers: builder => {
    // getFriendRequests
    builder
      .addCase(getFriendRequests.pending, (state) => {
        state.error = null;
      })
      .addCase(getFriendRequests.fulfilled, (state, action) => {
        state.friendRequests = action.payload;
      })
      .addCase(getFriendRequests.rejected, _handleRejected);
    // acceptFriendRequest
    builder
      .addCase(acceptFriendRequest.pending, _handleRequestPending)
      .addCase(acceptFriendRequest.fulfilled, _handleRequestFulfilled)
      .addCase(acceptFriendRequest.rejected, _handleRequestRejected);
    // declineFriendRequest
    builder
      .addCase(declineFriendRequest.pending, _handleRequestPending)
      .addCase(declineFriendRequest.fulfilled, _handleRequestFulfilled)
      .addCase(declineFriendRequest.rejected, _handleRequestRejected);
    // cancelFriendRequest
    builder
      .addCase(cancelFriendRequest.pending, _handleRequestPending)
      .addCase(cancelFriendRequest.fulfilled, _handleRequestFulfilled)
      .addCase(cancelFriendRequest.rejected, _handleRequestRejected);
  }
});

export default friendsSlice.reducer;

export const friendsActions = {
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  ...friendsSlice.actions
};