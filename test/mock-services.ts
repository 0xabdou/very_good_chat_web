import {instance, mock, reset} from "ts-mockito";
import IAuthRepository from "../src/features/auth/data/auth-repository";
import {IMeRepository} from "../src/features/user/data/me-repository";
import StoreExtraArg from "../src/store/store-extra-arg";
import {ISearchRepository} from "../src/features/search/data/search-repository";
import {IFriendRepository} from "../src/features/friend/data/friend-repository";
import {IBadgeRepository} from "../src/features/badge/data/badge-repository";
import {IBlockRepository} from "../src/features/block/data/block-respository";
import {INotificationRepository} from "../src/features/notification/data/notification-repository";

const mocks: StoreExtraArg = {
  authRepo: mock<IAuthRepository>(),
  meRepo: mock<IMeRepository>(),
  searchRepo: mock<ISearchRepository>(),
  friendRepo: mock<IFriendRepository>(),
  badgeRepo: mock<IBadgeRepository>(),
  blockRepo: mock<IBlockRepository>(),
  notificationRepo: mock<INotificationRepository>(),
};

const instances: StoreExtraArg = {
  authRepo: instance(mocks.authRepo),
  meRepo: instance(mocks.meRepo),
  searchRepo: instance(mocks.searchRepo),
  friendRepo: instance(mocks.friendRepo),
  badgeRepo: instance(mocks.badgeRepo),
  blockRepo: instance(mocks.blockRepo),
  notificationRepo: instance(mocks.notificationRepo)
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