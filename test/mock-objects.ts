import User, {UserCreation, UserUpdate} from "../src/features/user/types/user";
import {instance, mock} from "ts-mockito";
import {AppDispatch, AppState} from "../src/store/store";
import createMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import {authActions, AuthState} from "../src/features/auth/auth-slice";
import {userActions, UserState} from "../src/features/user/user-slice";
import {searchActions} from "../src/features/search/search-slice";
import {
  Friendship,
  FriendshipInfo,
  FriendshipStatus
} from "../src/features/friend/types/friendship";
import {MeQuery_me} from "../src/_generated/MeQuery";
import {GetFriendshipInfo_getFriendshipInfo} from "../src/_generated/GetFriendshipInfo";
import {GraphQLError} from "graphql";
import {ApolloError} from "@apollo/client";
import {FriendRequests} from "../src/features/friend/types/friend-request";
import {UpdateBadge_updateBadge} from "../src/_generated/UpdateBadge";
import {
  BadgeName as GQLBadgeName,
  NotificationType as GQLNotificationType
} from "../src/_generated/globalTypes";
import {Badge, BadgeName} from "../src/features/badge/types/badge";
import {GetNotifications_getNotifications} from "../src/_generated/GetNotifications";
import {
  Notification,
  RequestAcceptedNotification,
  SystemNotification
} from "../src/features/notification/types/notification";

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
  photo: {
    source: 'source',
    medium: 'medium',
    small: 'small'
  }
};

export const mockGQLUser: MeQuery_me = {
  __typename: "User",
  id: mockUser.id,
  username: mockUser.username,
  name: mockUser.name,
  photoURLSource: mockUser.photo?.source || null,
  photoURLMedium: mockUser.photo?.medium || null,
  photoURLSmall: mockUser.photo?.small || null,
};

export const mockUserCreation: UserCreation = {
  username: 'username',
  photo: instance(MockFile),
};

export const mockUserUpdate: UserUpdate = {
  username: 'username',
  deleteName: true,
  photo: instance(MockFile),
};

export const mockFriendship: Friendship = {
  status: FriendshipStatus.FRIENDS,
  date: new Date()
};

export const mockFriendshipInfo: FriendshipInfo = {
  user: mockUser,
  friendship: mockFriendship
};

export const mockGQLFriendshipInfo: GetFriendshipInfo_getFriendshipInfo = {
  __typename: 'FriendshipInfo',
  friendship: {
    __typename: 'Friendship',
    ...mockFriendship,
    date: mockFriendship.date ?? null,
  },
  user: mockGQLUser,
};

export const mockFriendRequests: FriendRequests = {
  sent: [{
    user: {...mockUser, id: 'sentID', username: 'sentUsername'},
    date: new Date(),
  }],
  received: [{
    user: {...mockUser, id: 'receivedUsername', username: 'receivedUsername'},
    date: new Date(),
  }]
};

export const mockGQLBadge: UpdateBadge_updateBadge = {
  __typename: 'Badge',
  badgeName: GQLBadgeName.FRIEND_REQUESTS,
  lastOpened: new Date()
};

export const mockBadge: Badge = {
  badgeName: BadgeName.FRIEND_REQUESTS,
  lastOpened: new Date()
};

export const mockGQLRANotification: GetNotifications_getNotifications = {
  __typename: 'Notification',
  id: 1,
  date: new Date(),
  seen: false,
  type: GQLNotificationType.REQUEST_ACCEPTED,
  friend: mockGQLUser
};
export const mockRANotification: Notification = {
  id: mockGQLRANotification.id,
  date: mockGQLRANotification.date,
  seen: mockGQLRANotification.seen,
  content: {
    type: mockGQLRANotification.type,
    user: mockUser
  } as RequestAcceptedNotification
};

export const mockGQLSystemNotification: GetNotifications_getNotifications = {
  ...mockGQLRANotification,
  type: GQLNotificationType.SYSTEM,
  friend: null
};

export const mockSystemNotification: Notification = {
  ...mockRANotification,
  content: {
    type: mockGQLSystemNotification.type,
    message: 'some system message'
  } as SystemNotification
};

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

export const getGraphQLError = (code: string) => {
  return new GraphQLError(
    'some message', undefined, undefined, undefined, undefined, undefined,
    {code}
  );
};

export const getApolloError = (code: string) => {
  return new ApolloError({
    errorMessage: 'some message',
    graphQLErrors: [getGraphQLError(code)]
  });
};