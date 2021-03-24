import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Notification} from "./types/notification";
import {ThunkAPI} from "../../store/store";
import {NotificationError} from "./types/notification-error";
import {isRight} from "fp-ts/Either";

export type NotificationState = {
  notifications: Notification[] | null,
  error: NotificationError | null,
};

export const initialNotificationState: NotificationState = {
  notifications: null,
  error: null
};

const getNotifications = createAsyncThunk<Notification[], void, ThunkAPI<NotificationError>>(
  'notification/getNotifications',
  async (_, thunkAPI) => {
    const result = await thunkAPI.extra.notificationRepo.getNotifications();
    if (isRight(result)) return result.right;
    return thunkAPI.rejectWithValue(result.left);
  }
);

const notificationSLice = createSlice({
  name: 'notification',
  initialState: initialNotificationState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        if (action.payload != undefined) state.error = action.payload;
        else state.error = NotificationError.general;
      });
  }
});

export default notificationSLice.reducer;

export const notificationActions = {
  getNotifications,
  ...notificationSLice.actions
};
