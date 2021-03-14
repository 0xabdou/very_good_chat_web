import {instance, mock, reset} from "ts-mockito";
import IAuthRepository from "../src/features/auth/data/auth-repository";
import {IUserRepository} from "../src/features/user/data/user-repository";
import StoreExtraArg from "../src/store/store-extra-arg";
import {ISearchRepository} from "../src/features/search/data/search-repository";

const mocks: StoreExtraArg = {
  authRepo: mock<IAuthRepository>(),
  userRepo: mock<IUserRepository>(),
  searchRepo: mock<ISearchRepository>(),
};

const instances: StoreExtraArg = {
  authRepo: instance(mocks.authRepo),
  userRepo: instance(mocks.userRepo),
  searchRepo: instance(mocks.searchRepo),
};

const mockServices = {
  mocks,
  instances,
};

export const resetMocks = () => {
  for (const mock of Object.values(mocks))
    reset(mock);
};

export default mockServices;