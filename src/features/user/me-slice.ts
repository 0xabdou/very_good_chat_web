import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Me, UserCreation, UserUpdate} from "./types/user";
import {ThunkAPI} from "../../store/store";
import UserError from "./types/user-error";
import {isRight} from "fp-ts/Either";

export type MeState = {
  initialized: boolean,
  me: Me | null,
  updatingUser: boolean,
  error: UserError | null,
}

const initialState: MeState = {
  initialized: false,
  me: null,
  updatingUser: false,
  error: null,
};

const getMe = createAsyncThunk<Me | null, void, ThunkAPI<UserError>>(
  'user/getMe',
  async (_, thunkApi) => {
    const result = await thunkApi.extra.meRepo.getMe();
    if (isRight(result)) {
      return result.right;
    }
    return thunkApi.rejectWithValue(result.left);
  }
);

const createMe = createAsyncThunk<Me, UserCreation, ThunkAPI<UserError>>(
  'user/createMe',
  async (creation, thunkApi) => {
    const result = await thunkApi.extra.meRepo.createMe(creation);
    if (isRight(result)) {
      return result.right;
    }
    return thunkApi.rejectWithValue(result.left);
  },
);

const updateMe = createAsyncThunk<Me, UserUpdate, ThunkAPI<UserError>>(
  'user/updateMe',
  async (update, thunkApi) => {
    const result = await thunkApi.extra.meRepo.updateMe(update);
    if (isRight(result)) {
      return result.right;
    }
    return thunkApi.rejectWithValue(result.left);
  },
);

const handleRejected = (state: MeState, error: UserError | undefined) => {
  console.log('REJECTED WITH: ', error);
  if (error != undefined) {
    state.error = error;
  } else
    state.error = UserError.general;
};

const meSlice = createSlice({
  name: 'me',
  initialState: initialState,
  reducers: {
    reset: (_) => initialState,
  },
  extraReducers: builder => {
    // getCurrentUser
    builder
      .addCase(getMe.pending, state => {
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.initialized = true;
        state.me = action.payload;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        if (action.payload == UserError.notFound) {
          state.initialized = true;
        } else
          handleRejected(state, action.payload);
      });
    // createUser
    builder
      .addCase(createMe.pending, state => {
        state.updatingUser = true;
        state.error = null;
      })
      .addCase(createMe.fulfilled, (state, action) => {
        state.me = action.payload;
        state.updatingUser = false;
      })
      .addCase(createMe.rejected, (state, action) => {
        handleRejected(state, action.payload);
        state.updatingUser = false;
      });
    // createUser
    builder
      .addCase(updateMe.pending, state => {
        state.updatingUser = true;
        state.error = null;
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.updatingUser = false;
        state.me = action.payload;
      })
      .addCase(updateMe.rejected, (state, action) => {
        handleRejected(state, action.payload);
        state.updatingUser = false;
      });
  },
});

export default meSlice.reducer;
export const meActions = {
  getMe,
  createMe,
  updateMe,
  ...meSlice.actions
};