import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import User from "../user/types/user";
import {Friendship, FriendshipInfo} from "./types/friendship";
import {ThunkApi} from "../../store/store";
import FriendError from "./types/friend-error";
import {isRight} from "fp-ts/Either";

export type FriendProfileState = {
  user: User | null,
  friendship: Friendship | null,
  loading: boolean
  modifyingFriendship: boolean,
  error: FriendError | null;
}

const getFriendshipInfo = createAsyncThunk<
  FriendshipInfo, string, ThunkApi<FriendError>
  >(
    'friendProfile/getFriendshipInfo',
  async (username, thunkAPI) => {
     const result = await thunkAPI.extra.friendRepo
       .getFriendshipInfo({username});
     if (isRight(result)) return result.right;
     return thunkAPI.rejectWithValue(result.left);
  }
);

const sendFriendRequest= createAsyncThunk<
  Friendship, void, ThunkApi<FriendError>
  >(
  'friendProfile/sendFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot send a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .sendFriendRequest(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const cancelFriendRequest = createAsyncThunk<
  Friendship, void, ThunkApi<FriendError>
  >(
  'friendProfile/cancelFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot cancel a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .cancelFriendRequest(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const acceptFriendRequest = createAsyncThunk<
  Friendship, void, ThunkApi<FriendError>
  >(
  'friendProfile/acceptFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot accept a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .acceptFriendRequest(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const declineFriendRequest = createAsyncThunk<
  Friendship, void, ThunkApi<FriendError>
  >(
  'friendProfile/declineFriendRequest',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot decline a friend request if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo
      .declineFriendRequest(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const unfriend= createAsyncThunk<
  Friendship, void, ThunkApi<FriendError>
  >(
  'friendProfile/unfriend',
  async (_, thunkAPI) => {
    const userID = thunkAPI.getState().friendProfile.user?.id;
    if (!userID) {
      console.log('Cannot unfriend a friend if no user exists in state');
      return thunkAPI.rejectWithValue(FriendError.general);
    }
    const result = await thunkAPI.extra.friendRepo.unfriend(userID);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
)

export const initialFriendProfileState: FriendProfileState = {
  user: null,
  friendship: null,
  loading: false,
  modifyingFriendship: false,
  error: null
};

const _handleRejected = (state: FriendProfileState, error? : FriendError) => {
  if (error == undefined) state.error = FriendError.general;
  else state.error = error;
  state.modifyingFriendship = false;
  state.loading = false;
}

const _handleFSChanging = (state: FriendProfileState) => {
  state.modifyingFriendship = true;
  state.error = null;
}

const _handleFSChanged= (state: FriendProfileState, fs: Friendship) => {
  state.modifyingFriendship = false;
  state.friendship = fs;
}

const friendProfileSlice = createSlice({
  name: 'friendProfile',
  initialState: initialFriendProfileState,
  reducers: {
    reset: () => initialFriendProfileState
  },
  extraReducers: builder => {
    builder
      .addCase(getFriendshipInfo.pending, () => {
        return {
          ...initialFriendProfileState,
          loading: true
        }
      })
      .addCase(getFriendshipInfo.fulfilled, (state, action)=> {
        state.loading = false;
        state.user = action.payload.user;
        state.friendship = action.payload.friendship;
      })
      .addCase(getFriendshipInfo.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
    builder
      .addCase(sendFriendRequest.pending, state => {
        _handleFSChanging(state);
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        _handleFSChanged(state, action.payload);
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
    builder
      .addCase(cancelFriendRequest.pending, state => {
        _handleFSChanging(state);
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        _handleFSChanged(state, action.payload);
      })
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
    builder
      .addCase(acceptFriendRequest.pending, state => {
        _handleFSChanging(state);
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        _handleFSChanged(state, action.payload);
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
    builder
      .addCase(declineFriendRequest.pending, state => {
        _handleFSChanging(state);
      })
      .addCase(declineFriendRequest.fulfilled, (state, action) => {
        _handleFSChanged(state, action.payload);
      })
      .addCase(declineFriendRequest.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
    builder
      .addCase(unfriend.pending, state => {
        _handleFSChanging(state);
      })
      .addCase(unfriend.fulfilled, (state, action) => {
        _handleFSChanged(state, action.payload);
      })
      .addCase(unfriend.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      });
  }
});

export default  friendProfileSlice.reducer;

export const friendProfileActions = {
  getFriendshipInfo,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  ...friendProfileSlice.actions,
}