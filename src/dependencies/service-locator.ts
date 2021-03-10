import createStore, {AppStore} from "../store/store";
import TYPES from "./types";
import {GoogleAuth} from "../features/auth/data/sources/google-auth";
import IAuthRepository, {AuthRepository} from "../features/auth/data/auth-repository";
import {
  ILocalStorage,
  LocalStorage
} from "../features/auth/data/sources/local-storage";
import {IUserAPI, UserAPI} from "../features/user/data/sources/user-api";
import {
  IUserRepository,
  UserRepository
} from "../features/user/data/user-repository";
import StoreExtraArg from "../store/store-extra-arg";
import {ApolloClient, ApolloLink, concat, InMemoryCache} from "@apollo/client";
import {AuthAPI, IAuthAPI} from "../features/auth/data/sources/auth-api";
import {createUploadLink} from 'apollo-upload-client';
import axios, {AxiosInstance} from "axios";


type Dependencies = { [key in TYPES]?: any };

export const SERVER_URL = 'http://localhost:4000';

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
  // ILocalStorage
  sl.register<ILocalStorage>(TYPES.ILocalStorage, new LocalStorage());
  // Auth
  sl.register<GoogleAuth>(TYPES.GoogleAuth, new GoogleAuth());
  //sl.register<IAuthApi>(TYPES.IAuthApi, new FakeAuthApi());

  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    const token = sl.get<AppStore>(TYPES.AppStore).getState().auth.accessToken;
    console.log('HHHHAAAAAAAAAAAAAAAAAAAAAAAAA: ', token);
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      }
    });
    return forward(operation);
  });

  const httpLink = createUploadLink({
    uri: `${SERVER_URL}/graphql`,
    credentials: 'include',
  });

  const client = new ApolloClient({
    cache: new InMemoryCache({}),
    connectToDevTools: true,
    link: concat(authMiddleware, httpLink),
  });
  sl.register<ApolloClient<any>>(TYPES.ApolloClient, client);
  sl.register<AxiosInstance>(
    TYPES.Axios,
    axios.create({
      baseURL: SERVER_URL,
      withCredentials: true,
    }),
  );

  sl.register<IAuthAPI>(
    TYPES.IAuthApi,
    new AuthAPI(sl.get(TYPES.ApolloClient), sl.get(TYPES.Axios))
  );
  //sl.register<IAuthApi>(TYPES.IAuthApi, new FakeAuthApi());
  sl.register<IAuthRepository>(
    TYPES.IAuthRepository,
    new AuthRepository(
      sl.get(TYPES.IAuthApi),
      sl.get(TYPES.GoogleAuth),
    ),
  );
  // User
  //sl.register<IUserApi>(TYPES.IUserApi, new FakeUserApi());
  sl.register<IUserAPI>(
    TYPES.IUserApi,
    new UserAPI(sl.get<ApolloClient<any>>(TYPES.ApolloClient))
  );
  sl.register<IUserRepository>(
    TYPES.IUserRepository,
    new UserRepository(sl.get(TYPES.IUserApi))
  );
  // Redux
  sl.register<StoreExtraArg>(
    TYPES.StoreExtraArgs,
    {
      authRepository: sl.get(TYPES.IAuthRepository),
      userRepository: sl.get(TYPES.IUserRepository),
    },
  );
  sl.register(
    TYPES.AppStore,
    createStore(sl.get(TYPES.StoreExtraArgs)),
  );
};

export {initDependencies};
export default sl;