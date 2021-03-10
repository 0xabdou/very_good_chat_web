import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import User, {UserCreation} from "./types/user";
import {ThunkApi} from "../../store/store";
import UserError from "./types/user-error";
import {isRight} from "fp-ts/Either";

export type UserState = {
  initialized: boolean,
  currentUser: User | null,
  creatingUser: boolean,
  error: UserError | null,
}

const initialState: UserState = {
  initialized: false,
  currentUser: null,
  creatingUser: false,
  error: null,
};

const getCurrentUser = createAsyncThunk<User | null, void, ThunkApi<UserError>>(
  'user/getCurrentUser',
  async (_, thunkApi) => {
    const result = await thunkApi.extra.userRepository.getCurrentUser();
    if (isRight(result)) {
      return result.right;
    }
    return thunkApi.rejectWithValue(result.left);
  }
);

const createUser = createAsyncThunk<User, UserCreation, ThunkApi<UserError>>(
  'user/createUser',
  async (creation, thunkApi) => {
    const result = await thunkApi.extra.userRepository.createUser(creation);
    if (isRight(result)) {
      return result.right;
    }
    return thunkApi.rejectWithValue(result.left);
  },
);

const handleRejected = (state: UserState, error: UserError | undefined) => {
  console.log('REJECTED WITH: ', error);
  if (error != undefined) {
    state.error = error;
  } else
    state.error = UserError.general;
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    resetUser: (_) => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(getCurrentUser.pending, state => {
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.initialized = true;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        if (action.payload == UserError.notFound) {
          state.initialized = true;
        } else
          handleRejected(state, action.payload);
      });
    builder
      .addCase(createUser.pending, state => {
        state.creatingUser = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.creatingUser = false;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        handleRejected(state, action.payload);
        state.creatingUser = false;
      });
  },
});

export default userSlice.reducer;
export const userActions = {getCurrentUser, createUser, ...userSlice.actions};