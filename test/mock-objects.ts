import User, {
  Me,
  UserCreation,
  UserUpdate
} from "../src/features/user/types/user";
import {instance, mock} from "ts-mockito";
import {AppDispatch, AppState} from "../src/core/redux/store";
import createMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import {AuthState} from "../src/features/auth/auth-slice";
import {MeState} from "../src/features/user/me-slice";
import {
  Friendship,
  FriendshipInfo,
  FriendshipStatus
} from "../src/features/friend/types/friendship";
import {MeQuery_me, MeQuery_me_user} from "../src/_generated/MeQuery";
import {GetFriendshipInfo_getFriendshipInfo} from "../src/_generated/GetFriendshipInfo";
import {GraphQLError} from "graphql";
import {ApolloError} from "@apollo/client";
import {FriendRequests} from "../src/features/friend/types/friend-request";
import {UpdateBadge_updateBadge} from "../src/_generated/UpdateBadge";
import {
  BadgeName as GQLBadgeName,
  ConversationType,
  ConversationType as GQLConversationType,
  MediaType as GQLMediaType,
  NotificationType as GQLNotificationType
} from "../src/_generated/globalTypes";
import {Badge, BadgeName} from "../src/features/badge/types/badge";
import {GetNotifications_getNotifications} from "../src/_generated/GetNotifications";
import {
  Notification,
  RequestAcceptedNotification,
  SystemNotification
} from "../src/features/notification/types/notification";
import {BlockMutation_block} from "../src/_generated/BlockMutation";
import {Block} from "../src/features/block/types/block";
import {UserAPI} from "../src/features/user/data/sources/user-api";
import Friend from "../src/features/friend/types/friend";
import {
  SendMessage_sendMessage,
  SendMessage_sendMessage_medias
} from "../src/_generated/SendMessage";
import {Media, MediaType} from "../src/features/chat/types/media";
import Message from "../src/features/chat/types/message";
import {
  GetConversations_getConversations as GQLConversation,
  GetConversations_getConversations_messages as GQLMessage
} from "../src/_generated/GetConversations";
import Conversation from "../src/features/chat/types/conversation";
import ChatAPI, {SendMessageInput} from "../src/features/chat/data/sources/chat-api";
import {GetFriends_getFriends_user as GQLUser} from "../src/_generated/GetFriends";
import {SubscribeToTypings_typings} from "../src/_generated/SubscribeToTypings";
import Typing, {TypingInput} from "../src/features/chat/types/typing";

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
export const initialMeState: MeState = {
  initialized: false,
  me: null,
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

export const mockGQLUser: MeQuery_me_user = {
  __typename: "User",
  id: mockUser.id,
  username: mockUser.username,
  name: mockUser.name,
  photoURLSource: mockUser.photo?.source || null,
  photoURLMedium: mockUser.photo?.medium || null,
  photoURLSmall: mockUser.photo?.small || null,
};

export const mockGQLMe: MeQuery_me = {
  __typename: 'Me',
  user: mockGQLUser,
  activeStatus: true,
};

export const mockMe: Me = {
  ...mockUser,
  activeStatus: mockGQLMe.activeStatus
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
  date: new Date().getTime()
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
    date: new Date().getTime(),
  }],
  received: [{
    user: {...mockUser, id: 'receivedUsername', username: 'receivedUsername'},
    date: new Date().getTime(),
  }]
};

export const mockFriend: Friend = {
  user: mockUser,
  date: new Date().getTime(),
  lastSeen: new Date().getTime()
};

export const mockGQLBadge: UpdateBadge_updateBadge = {
  __typename: 'Badge',
  badgeName: GQLBadgeName.FRIEND_REQUESTS,
  lastOpened: new Date()
};

export const mockBadge: Badge = {
  badgeName: BadgeName.FRIEND_REQUESTS,
  lastOpened: new Date().getTime()
};

export const mockGQLRANotification: GetNotifications_getNotifications = {
  __typename: 'Notification',
  id: 1,
  date: new Date().getTime(),
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

export const mockGQLBlock: BlockMutation_block = {
  __typename: 'Block',
  user: {...mockGQLUser},
  date: new Date().getTime()
};
export const mockBlock: Block = {
  user: UserAPI.parseUser(mockGQLBlock.user),
  date: mockGQLBlock.date,
};

export const mockGQLMedia: SendMessage_sendMessage_medias = {
  __typename: 'Media',
  url: 'media url',
  thumbUrl: 'thumb media url',
  type: GQLMediaType.IMAGE
};

export const mockMedia: Media = {
  url: mockGQLMedia.url,
  thumbUrl: mockGQLMedia.thumbUrl ?? undefined,
  type: MediaType[mockGQLMedia.type]
};

const conversationID = 199;

export const mockGQLMessage: SendMessage_sendMessage = {
  __typename: 'Message',
  id: 911,
  conversationID,
  senderID: 'sendIDD',
  text: 'Hello world',
  medias: [mockGQLMedia],
  sentAt: new Date().getTime(),
  deliveredTo: [{
    __typename: "Delivery",
    userID: 'abcd',
    date: new Date().getTime()
  }],
  seenBy: [{
    __typename: "Delivery",
    userID: 'efgh',
    date: new Date().getTime()
  }],
};

export const mockMessage: Message = {
  id: mockGQLMessage.id,
  conversationID: mockGQLMessage.conversationID,
  senderID: mockGQLMessage.senderID,
  text: mockGQLMessage.text ?? undefined,
  medias: [mockMedia],
  sentAt: mockGQLMessage.sentAt,
  deliveredTo: mockGQLMessage.deliveredTo.map(d => ({
    userID: d.userID,
    date: d.date
  })),
  seenBy: mockGQLMessage.seenBy.map(d => ({userID: d.userID, date: d.date})),
  sent: true,
};

const getConvs = (): [GQLConversation, Conversation] => {
  const user1: GQLUser = {...mockGQLUser, id: 'zblbola'};
  const user2: GQLUser = {...mockGQLUser, id: 'a3sobix'};
  const message1: GQLMessage = {
    ...mockGQLMessage,
    id: 0,
    senderID: user1.id,
    sentAt: new Date().getTime(),
    seenBy: [{
      __typename: 'Delivery',
      userID: user2.id,
      date: new Date().getTime()
    }]
  };
  const message2: GQLMessage = {
    ...mockGQLMessage,
    id: 2,
    senderID: user2.id,
    sentAt: new Date().getTime() + 10000,
    seenBy: [{
      __typename: 'Delivery',
      userID: user1.id,
      date: new Date().getTime() + 10000
    }]
  };
  const GQLConv: GQLConversation = {
    __typename: 'Conversation' as 'Conversation',
    id: 546576879,
    type: GQLConversationType.ONE_TO_ONE,
    participants: [user1, user2],
    messages: [message1, message2],
    canChat: true,
  };
  const conv: Conversation = {
    id: GQLConv.id,
    type: ConversationType[GQLConv.type],
    participants: GQLConv.participants.map(UserAPI.parseUser),
    messages: GQLConv.messages.map(ChatAPI.parseMessage),
    canChat: GQLConv.canChat,
  };
  return [GQLConv, conv];
};

export const [mockGQLConversation, mockConversation] = getConvs();

export const mockSendMessageInput: SendMessageInput = {
  conversationID: 911,
  text: 'Hello world',
  medias: [new File(['1', '2', '3'], "viva l'Algerie")]
};

export const mockGQLTyping: SubscribeToTypings_typings = {
  __typename: 'Typing',
  conversationID: 123,
  userID: "123",
  started: true,
};

export const mockTyping: Typing = {
  conversationID: mockGQLTyping.conversationID,
  userID: mockGQLTyping.userID,
  started: mockGQLTyping.started,
};

export const mockTypingInput: TypingInput = {
  conversationID: 412124,
  started: true,
};

export const getMockStore = () => createMockStore<AppState, AppDispatch>([thunk]);

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

export const mockTheDate = (): [jest.SpyInstance, Date] => {
  const mocked = new Date();
  const spy = jest
    .spyOn(global, 'Date')
    .mockImplementation(() => mocked as unknown as string);
  return [spy, mocked];
};

// How to mock Date
//jest.mock(
//  'react-virtualized-auto-sizer',
//  () => ({children}: any) => children({height: 600, width: 600})
//);