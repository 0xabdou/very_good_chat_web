import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import User from "../user/types/user";
import {Friendship, FriendshipInfo, FriendshipStatus} from "./types/friendship";
import {AppDispatch, ThunkAPI} from "../../core/redux/store";
import FriendError from "./types/friend-error";
import {isRight} from "fp-ts/Either";
import {blockToFriendError} from "../block/types/block-error";
import {friendsActions} from "./friends-slice";

export type FriendProfileState = {
  user: User | null,
  friendship: Friendship | null,
  loading: boolean
  modifyingFriendship: boolean,
  error: FriendError | null;
}

const getFriendshipInfo = createAsyncThunk<FriendshipInfo, string, ThunkAPI<FriendError>>(
  'friendProfile/getFriendshipInfo',
  async (username, thunkAPI) => {
    const result = await thunkAPI.extra.friendRepo
      .getFriendshipInfo({username});
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const sendFriendRequest = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/sendFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot send a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .sendFriendRequest(userID);
    if (isRight(result)) {
      notifyFriendsSlice(thunkAPI.dispatch);
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const cancelFriendRequest = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/cancelFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot cancel a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .cancelFriendRequest(userID);
    if (isRight(result)) {
      notifyFriendsSlice(
        thunkAPI.dispatch,
        thunkAPI.getState().friendProfile.user!.id
      );
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const acceptFriendRequest = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/acceptFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot accept a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .acceptFriendRequest(userID);
    if (isRight(result)) {
      notifyFriendsSlice(
        thunkAPI.dispatch,
        thunkAPI.getState().friendProfile.user!.id
      );
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const declineFriendRequest = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/declineFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot decline a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .declineFriendRequest(userID);
    if (isRight(result)) {
      notifyFriendsSlice(
        thunkAPI.dispatch,
        thunkAPI.getState().friendProfile.user!.id
      );
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const unfriend = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/unfriend',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot unfriend a friend if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo.unfriend(userID);
    if (isRight(result)) {
      notifyFriendsSlice(thunkAPI.dispatch);
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const block = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/block',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot block a user if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.blockRepo.block(userID);
    if (isRight(result)) {
      notifyFriendsSlice(thunkAPI.dispatch);
      return {status: FriendshipStatus.BLOCKING};
    }
    return thunkAPI.rejectWithValue(blockToFriendError(result.left));
  }
);

const unblock = createAsyncThunk<Friendship, void, ThunkAPI<FriendError>>(
  'friendProfile/unblock',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot unblock a user if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.blockRepo.unblock(userID);
    if (isRight(result)) return {status: FriendshipStatus.STRANGERS};
    return thunkAPI.rejectWithValue(blockToFriendError(result.left));
  }
);

const notifyFriendsSlice = (dispatch: AppDispatch, userID?: string) => {
  if (userID) dispatch(friendsActions.requestRemoved(userID));
  dispatch(friendsActions.getFriendRequests());
  dispatch(friendsActions.getFriends());
};

export const initialFriendProfileState: FriendProfileState = {
  user: null,
  friendship: null,
  loading: false,
  modifyingFriendship: false,
  error: null
};

export const _handleRejected = (state: FriendProfileState, action: PayloadAction<FriendError | undefined>) => {
  if (action.payload == undefined) state.error = FriendError.general;
  else state.error = action.payload;
  state.modifyingFriendship = false;
  state.loading = false;
};

export const _handleFSChanging = (state: FriendProfileState) => {
  state.modifyingFriendship = true;
  state.error = null;
};

export const _handleFSChanged = (state: FriendProfileState, action: PayloadAction<Friendship>) => {
  state.modifyingFriendship = false;
  state.friendship = action.payload;
};

const friendProfileSlice = createSlice({
  name: 'friendProfile',
  initialState: initialFriendProfileState,
  reducers: {
    reset: () => initialFriendProfileState
  },
  extraReducers: builder => {
    // getFriendshipInfo
    builder
      .addCase(getFriendshipInfo.pending, () => {
        return {
          ...initialFriendProfileState,
          loading: true
        };
      })
      .addCase(getFriendshipInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.friendship = action.payload.friendship;
      })
      .addCase(getFriendshipInfo.rejected, _handleRejected);
    // sendFriendRequest
    builder
      .addCase(sendFriendRequest.pending, _handleFSChanging)
      .addCase(sendFriendRequest.fulfilled, _handleFSChanged)
      .addCase(sendFriendRequest.rejected, _handleRejected);
    // cancelFriendRequest
    builder
      .addCase(cancelFriendRequest.pending, _handleFSChanging)
      .addCase(cancelFriendRequest.fulfilled, _handleFSChanged)
      .addCase(cancelFriendRequest.rejected, _handleRejected);
    // acceptFriendRequest
    builder
      .addCase(acceptFriendRequest.pending, _handleFSChanging)
      .addCase(acceptFriendRequest.fulfilled, _handleFSChanged)
      .addCase(acceptFriendRequest.rejected, _handleRejected);
    // declineFriendRequest
    builder
      .addCase(declineFriendRequest.pending, _handleFSChanging)
      .addCase(declineFriendRequest.fulfilled, _handleFSChanged)
      .addCase(declineFriendRequest.rejected, _handleRejected);
    // unfriend
    builder
      .addCase(unfriend.pending, _handleFSChanging)
      .addCase(unfriend.fulfilled, _handleFSChanged)
      .addCase(unfriend.rejected, _handleRejected);
    // block
    builder
      .addCase(block.pending, _handleFSChanging)
      .addCase(block.fulfilled, _handleFSChanged)
      .addCase(block.rejected, _handleRejected);
    // unblock
    builder
      .addCase(unblock.pending, _handleFSChanging)
      .addCase(unblock.fulfilled, _handleFSChanged)
      .addCase(unblock.rejected, _handleRejected);
  }
});

export default friendProfileSlice.reducer;

export const friendProfileActions = {
  getFriendshipInfo,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  block,
  unblock,
  ...friendProfileSlice.actions,
};