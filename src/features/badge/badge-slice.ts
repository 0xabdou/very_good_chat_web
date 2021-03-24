import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Badge, BadgeName} from "./types/badge";
import {ThunkAPI} from "../../store/store";
import BadgeError from "./types/badge-error";
import {isRight} from "fp-ts/Either";

export type BadgeState = {
  notifications: Date | null,
  friendRequests: Date | null,
}

export const initialBadgeState: BadgeState = {
  notifications: null,
  friendRequests: null,
};

const getBadges = createAsyncThunk<Badge[], void, ThunkAPI<BadgeError>>(
  'badge/getBadges',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.badgeRepo.getBadges();
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const updateBadge = createAsyncThunk<Badge, BadgeName, ThunkAPI<BadgeError>>(
  'badge/updateBadge',
  async (badgeName, thunkAPI) => {
    const result = await thunkAPI.extra.badgeRepo.updateBadge(badgeName);
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const badgeSlice = createSlice({
  name: 'badge',
  initialState: initialBadgeState,
  reducers: {},
  extraReducers: builder => {
    // getBadges
    builder
      .addCase(getBadges.fulfilled, (state, action) => {
        action.payload.forEach(b => {
          if (b.badgeName == BadgeName.NOTIFICATIONS) {
            state.notifications = b.lastOpened;
          } else {
            state.friendRequests = b.lastOpened;
          }
        });
      });
    // updateBadge
    builder
      .addCase(updateBadge.pending, (state, action) => {
        const badgeName = action.meta.arg;
        if (badgeName == BadgeName.NOTIFICATIONS) {
          state.notifications = new Date();
        } else {
          state.friendRequests = new Date();
        }
      });
  }
});

export default badgeSlice.reducer;
export const badgeActions = {getBadges, updateBadge, ...badgeSlice.actions};