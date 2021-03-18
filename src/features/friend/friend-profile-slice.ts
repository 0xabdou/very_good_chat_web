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
}

const friendProfileSlice = createSlice({
  name: 'friendProfile',
  initialState: initialFriendProfileState,
  reducers: {
    reset: () => initialFriendProfileState
  },
  extraReducers: builder => {
    builder
      .addCase(getFriendshipInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFriendshipInfo.fulfilled, (state, action)=> {
        state.loading = false;
        state.user = action.payload.user;
        state.friendship = action.payload.friendship;
      })
      .addCase(getFriendshipInfo.rejected, (state, action) => {
        _handleRejected(state, action.payload);
      })
  }
});

export default  friendProfileSlice.reducer;

export const friendProfileActions = {
  getFriendshipInfo,
  ...friendProfileSlice.actions,
}