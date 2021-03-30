import IAuthRepository from "../features/auth/data/auth-repository";
import {IMeRepository} from "../features/user/data/me-repository";
import {ISearchRepository} from "../features/search/data/search-repository";
import {IFriendRepository} from "../features/friend/data/friend-repository";
import {IBadgeRepository} from "../features/badge/data/badge-repository";
import {INotificationRepository} from "../features/notification/data/notification-repository";
import {IBlockRepository} from "../features/block/data/block-respository";

type StoreExtraArg = {
  authRepo: IAuthRepository,
  meRepo: IMeRepository,
  searchRepo: ISearchRepository,
  friendRepo: IFriendRepository,
  badgeRepo: IBadgeRepository,
  blockRepo: IBlockRepository,
  notificationRepo: INotificationRepository,
};

export default StoreExtraArg;

