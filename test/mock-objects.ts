import User, {UserCreation, UserUpdate} from "../src/features/user/types/user";
import {instance, mock} from "ts-mockito";
import {AppDispatch, AppState} from "../src/store/store";
import createMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import {authActions, AuthState} from "../src/features/auth/auth-slice";
import {userActions, UserState} from "../src/features/user/user-slice";
import {searchActions} from "../src/features/search/search-slice";
import {
  Friendship, FriendshipInfo,
  FriendshipStatus
} from "../src/features/friend/types/friendship";

export const MockFile = mock<File>();

export const initialAuthState: AuthState = {
  initialized: false,
  accessToken: null,
  authUser: null,
  authError: null,
  loading: false,
};
export const loggedInAuthState: AuthState = {
  initialized: true,
  accessToken: 'some_access_token',
  authUser: null,
  loading: false,
  authError: null,
};
export const initialUserState: UserState = {
  initialized: false,
  currentUser: null,
  error: null,
  updatingUser: false,
};

export const mockUser: User = {
  id: 'id',
  username: 'username',
  name: 'name',
  photoURL: 'photoUrl',
};

export const mockUserCreation: UserCreation = {
  username: 'username',
  photo: instance(MockFile),
};

export const mockUserUpdate : UserUpdate= {
  username: 'username',
  deleteName: true,
  photo: instance(MockFile),
};

export const mockFriendship : Friendship = {
  status: FriendshipStatus.FRIENDS,
  date: new Date()
}

export const mockFriendshipInfo : FriendshipInfo = {
  user: mockUser,
  friendship: mockFriendship
}

export const getMockStore = () => createMockStore<AppState, AppDispatch>([thunk]);

export const mockAuthActionObjects = {
  signInWithGoogle: {type: 'signInWithGoogle'},
  getAccessToken: {type: 'getAccessToken'},
  signOut: {type: 'signOut'},
};

export const getMockAuthActions = () => ({
  signInWithGoogle: jest.fn(() => mockAuthActionObjects.signInWithGoogle),
  getAccessToken: jest.fn(() => mockAuthActionObjects.getAccessToken),
  signOut: jest.fn(() => mockAuthActionObjects.signOut),
}) as unknown as typeof authActions;


export const mockUserActionObjects = {
  getCurrentUser: {type: 'getCurrentUser'},
  createUser: {type: 'createUser'},
  updateUser: {type: 'updateUser'},
  resetUser: {type: 'resetUser'},
};

export const getMockUserActions = () => ({
  getCurrentUser: jest.fn(() => mockUserActionObjects.getCurrentUser),
  createUser: jest.fn(() => mockUserActionObjects.createUser),
  updateUser: jest.fn(() => mockUserActionObjects.updateUser),
  resetUser: jest.fn(() => mockUserActionObjects.resetUser),
}) as unknown as typeof userActions;

export const mockSearchActionObjects = {
  searchForUsers: {type: 'searchForUsers'},
};

export const getMockSearchActions = () => ({
  searchForUsers: jest.fn(() => mockSearchActionObjects.searchForUsers),
}) as unknown as typeof searchActions;