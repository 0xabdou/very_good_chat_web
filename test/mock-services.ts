import {instance, mock, reset} from "ts-mockito";
import IAuthRepository from "../src/features/auth/data/auth-repository";
import {IUserRepository} from "../src/features/user/data/user-repository";
import StoreExtraArg from "../src/store/store-extra-arg";
import {ISearchRepository} from "../src/features/search/data/search-repository";
import {IFriendRepository} from "../src/features/friend/data/friend-repository";
import {IBadgeRepository} from "../src/features/badge/data/badge-repository";

const mocks: StoreExtraArg = {
  authRepo: mock<IAuthRepository>(),
  userRepo: mock<IUserRepository>(),
  searchRepo: mock<ISearchRepository>(),
  friendRepo: mock<IFriendRepository>(),
  badgeRepo: mock<IBadgeRepository>()
};

const instances: StoreExtraArg = {
  authRepo: instance(mocks.authRepo),
  userRepo: instance(mocks.userRepo),
  searchRepo: instance(mocks.searchRepo),
  friendRepo: instance(mocks.friendRepo),
  badgeRepo: instance(mocks.badgeRepo)
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