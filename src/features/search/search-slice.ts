import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import User from "../user/types/user";
import {SearchError} from "./types/search-error";
import {ThunkAPI} from "../../store/store";
import {isRight} from "fp-ts/These";

export type SearchState = {
  searchQuery: string | null,
  loading: boolean,
  results: User[] | null,
  error: SearchError | null,
}

export const initialSearchState: SearchState = {
  searchQuery: null,
  loading: false,
  results: null,
  error: null,
};

const searchForUsers = createAsyncThunk<User[], string, ThunkAPI<SearchError>>(
  'search/searchForUsers',
  async (searchQuery, thunkAPI) => {
    const result = await thunkAPI.extra.searchRepo.findUsers(searchQuery);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: initialSearchState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(searchForUsers.pending, (state, a) => {
        state.error = null;
        state.loading = true;
        state.searchQuery = a.meta.arg;
      })
      .addCase(searchForUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchForUsers.rejected, (state, action) => {
        state.loading = false;
        if (action.payload == undefined)
          state.error = SearchError.general;
        else
          state.error = action.payload;
      });
  },
});

export default searchSlice.reducer;
export const searchActions = {searchForUsers};