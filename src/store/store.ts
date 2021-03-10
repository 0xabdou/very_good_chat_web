import {combineReducers, configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import authReducer from '../features/auth/auth-slice';
import userReducer from '../features/user/user-slice';
import StoreExtraArg from "./store-extra-arg";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

const createStore = (services: StoreExtraArg) => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      thunk: {extraArgument: services}
    })
  });
};

export type AppStore = ReturnType<typeof createStore>;

export type AppState = ReturnType<typeof rootReducer>;

export type AppDispatch = AppStore['dispatch'];

export type ThunkApi<RejectType> = {
  dispatch: AppDispatch,
  state: AppState,
  extra: StoreExtraArg,
  rejectValue: RejectType,
};

export default createStore;

