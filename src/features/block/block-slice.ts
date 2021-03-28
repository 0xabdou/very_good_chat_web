import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Block} from "./types/block";
import BlockError from "./types/block-error";
import {ThunkAPI} from "../../store/store";
import {isRight} from "fp-ts/Either";

export type BlockState = {
  blocks: Block[] | null,
  error: BlockError | null
}

export const initialBlockState: BlockState = {
  blocks: null,
  error: null
};

const getBlockedUsers = createAsyncThunk<Block[], void, ThunkAPI<BlockError>>(
  'block/getBlockedUsers',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.blockRepo.getBlockedUsers();
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const blockSlice = createSlice({
  name: 'block',
  initialState: initialBlockState,
  reducers: {},
  extraReducers: builder => {
    // getBlockedUsers
    builder
      .addCase(getBlockedUsers.pending, state => {
        state.error = null;
      })
      .addCase(getBlockedUsers.fulfilled, (state, action) => {
        state.blocks = action.payload;
      })
      .addCase(getBlockedUsers.rejected, (state, action) => {
        state.error = action.payload == undefined
          ? BlockError.general
          : action.payload;
      });
  }
});

export default blockSlice.reducer;
export const blockActions = {
  getBlockedUsers,
  ...blockSlice.actions
};