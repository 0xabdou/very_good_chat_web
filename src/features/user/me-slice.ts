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
  'me/getMe',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.meRepo.getMe();
    if (isRight(result)) {
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const createMe = createAsyncThunk<Me, UserCreation, ThunkAPI<UserError>>(
  'me/createMe',
  async (creation, thunkAPI) => {
    const result = await thunkAPI.extra.meRepo.createMe(creation);
    if (isRight(result)) {
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  },
);

const updateMe = createAsyncThunk<Me, UserUpdate, ThunkAPI<UserError>>(
  'me/updateMe',
  async (update, thunkAPI) => {
    const result = await thunkAPI.extra.meRepo.updateMe(update);
    if (isRight(result)) {
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  },
);

const toggleActiveStatus = createAsyncThunk<boolean, void, ThunkAPI<UserError>>(
  'me/toggleActiveStatus',
  async (_, thunkAPI) => {
    // No need to negate the activeStatus, because it's already done in the pending reducer
    const activeStatus = thunkAPI.getState().me.me!.activeStatus;
    const result = await thunkAPI.extra.meRepo.updateActiveStatus(activeStatus);
    if (isRight(result)) {
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const updateLastSeen = createAsyncThunk<number, void, ThunkAPI<UserError>>(
  'me/updateLastSeen',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.meRepo.updateLastSeen();
    if (isRight(result)) {
      return result.right;
    }
    return thunkAPI.rejectWithValue(result.left);
  }
);

const handleRejected = (state: MeState, error: UserError | undefined) => {
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
    // toggleActiveStatus
    builder
      .addCase(toggleActiveStatus.pending, (state) => {
        state.error = null;
        state.updatingUser = true;
        state.me!.activeStatus = !state.me!.activeStatus;
      })
      .addCase(toggleActiveStatus.fulfilled, (state) => {
        state.updatingUser = false;
      })
      .addCase(toggleActiveStatus.rejected, (state, action) => {
        handleRejected(state, action.payload);
        state.updatingUser = false;
        state.me!.activeStatus = !state.me!.activeStatus;
      });
  },
});

export default meSlice.reducer;
export const meActions = {
  getMe,
  createMe,
  updateMe,
  toggleActiveStatus,
  updateLastSeen,
  ...meSlice.actions
};