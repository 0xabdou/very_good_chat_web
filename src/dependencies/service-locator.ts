import createStore from "../core/redux/store";
import TYPES from "./types";
import GoogleAuth from "../features/auth/data/sources/google-auth";
import IAuthRepository, {AuthRepository} from "../features/auth/data/auth-repository";
import {IUserAPI, UserAPI} from "../features/user/data/sources/user-api";
import {IMeRepository, MeRepository} from "../features/user/data/me-repository";
import StoreExtraArg from "../core/redux/store-extra-arg";
import {ApolloClient} from "@apollo/client";
import {AuthAPI, IAuthAPI} from "../features/auth/data/sources/auth-api";
import axios, {AxiosInstance} from "axios";
import {
  ISearchRepository,
  SearchRepository
} from "../features/search/data/search-repository";
import FriendRepository, {IFriendRepository} from "../features/friend/data/friend-repository";
import FriendAPI, {IFriendAPI} from "../features/friend/data/sources/friend-api";
import BadgeAPI, {IBadgeAPI} from "../features/badge/data/sources/badge-api";
import BadgeRepository, {IBadgeRepository} from "../features/badge/data/badge-repository";
import NotificationAPI, {INotificationAPI} from "../features/notification/data/sources/notification-api";
import NotificationRepository, {INotificationRepository} from "../features/notification/data/notification-repository";
import BlockAPI, {IBlockAPI} from "../features/block/data/sources/block-api";
import BlockRepository, {IBlockRepository} from "../features/block/data/block-respository";
import ChatAPI, {IChatAPI} from "../features/chat/data/sources/chat-api";
import ChatRepository, {IChatRepository} from "../features/chat/data/chat-repository";
import {FileUtils, IFileUtils} from "../shared/utils/file-utils";
import apolloClient from "../core/apollo/client";

type Dependencies = { [key in TYPES]?: any };

class ServiceLocator {
  private _dependencies: Dependencies = {};

  get<T>(type: TYPES): T {
    const dep: T = this._dependencies[type];
    if (dep == undefined) {
      throw new Error(`The dependency of type ${type} is not registered yet`);
    }
    return dep;
  };

  register<T>(type: TYPES, dep: T) {
    const existingDep = this._dependencies[type];
    if (existingDep) {
      //throw new Error(`The dependency of type ${type} is already registered`);
      console.log(`The dependency of type ${type} is already registered`);
    }
    this._dependencies[type] = dep;
  };
}

const sl = new ServiceLocator();
const initDependencies = async () => {
  // Auth
  sl.register<GoogleAuth>(TYPES.GoogleAuth, new GoogleAuth());
  // Apollo
  sl.register<ApolloClient<any>>(TYPES.ApolloClient, apolloClient);
  // Axios
  sl.register<AxiosInstance>(
    TYPES.Axios,
    axios.create({
      baseURL: `${processEnv.VITE_SERVER_URL_HTTP}`,
      withCredentials: true,
    }),
  );
  // File utils
  sl.register<IFileUtils>(TYPES.IFileUtils, new FileUtils());
  // Auth
  sl.register<IAuthAPI>(
    TYPES.IAuthApi,
    new AuthAPI(sl.get(TYPES.ApolloClient), sl.get(TYPES.Axios))
  );
  sl.register<IAuthRepository>(
    TYPES.IAuthRepository,
    new AuthRepository(
      sl.get(TYPES.IAuthApi),
      sl.get(TYPES.GoogleAuth),
    ),
  );
  // User
  sl.register<IUserAPI>(
    TYPES.IUserApi,
    new UserAPI(sl.get<ApolloClient<any>>(TYPES.ApolloClient))
  );
  sl.register<IMeRepository>(
    TYPES.IUserRepository,
    new MeRepository(sl.get(TYPES.IUserApi))
  );
  // Search
  sl.register<ISearchRepository>(
    TYPES.ISearchRepository,
    new SearchRepository(sl.get(TYPES.IUserApi))
  );
  // Friend
  sl.register<IFriendAPI>(
    TYPES.IFriendAPI,
    new FriendAPI(sl.get(TYPES.ApolloClient))
  );
  sl.register<IFriendRepository>(
    TYPES.IFriendRepository,
    new FriendRepository(sl.get(TYPES.IFriendAPI))
  );
  // Badge
  sl.register<IBadgeAPI>(
    TYPES.IBadgeAPI,
    new BadgeAPI(sl.get(TYPES.ApolloClient))
  );
  sl.register<IBadgeRepository>(
    TYPES.IBadgeRepository,
    new BadgeRepository(sl.get(TYPES.IBadgeAPI))
  );
  // Block
  sl.register<IBlockAPI>(
    TYPES.IBlockAPI,
    new BlockAPI(sl.get(TYPES.ApolloClient))
  );
  sl.register<IBlockRepository>(
    TYPES.IBlockRepository,
    new BlockRepository(sl.get(TYPES.IBlockAPI))
  );
  // Notification
  sl.register<INotificationAPI>(
    TYPES.INotificationAPI,
    new NotificationAPI(sl.get(TYPES.ApolloClient))
  );
  sl.register<INotificationRepository>(
    TYPES.INotificationRepository,
    new NotificationRepository(sl.get(TYPES.INotificationAPI))
  );
  // Chat
  sl.register<IChatAPI>(
    TYPES.IChatAPI,
    new ChatAPI(sl.get(TYPES.ApolloClient))
  );
  sl.register<IChatRepository>(
    TYPES.IChatRepository,
    new ChatRepository(sl.get(TYPES.IChatAPI))
  );
  // Redux
  sl.register<StoreExtraArg>(
    TYPES.StoreExtraArgs,
    {
      authRepo: sl.get(TYPES.IAuthRepository),
      meRepo: sl.get(TYPES.IUserRepository),
      searchRepo: sl.get(TYPES.ISearchRepository),
      friendRepo: sl.get(TYPES.IFriendRepository),
      badgeRepo: sl.get(TYPES.IBadgeRepository),
      blockRepo: sl.get(TYPES.IBlockRepository),
      notificationRepo: sl.get(TYPES.INotificationRepository),
      chatRepo: sl.get(TYPES.IChatRepository),
      fileUtils: sl.get(TYPES.IFileUtils),
    },
  );
  sl.register(
    TYPES.AppStore,
    createStore(sl.get(TYPES.StoreExtraArgs)),
  );
};

export {initDependencies};
export default sl;