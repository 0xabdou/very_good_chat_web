import IAuthRepository from "../features/auth/data/auth-repository";
import {IUserRepository} from "../features/user/data/user-repository";
import {ISearchRepository} from "../features/search/data/search-repository";
import {IFriendRepository} from "../features/friend/data/friend-repository";
import {IBadgeRepository} from "../features/badge/data/badge-repository";
import {INotificationRepository} from "../features/notification/data/notification-repository";
import {IBlockRepository} from "../features/block/data/block-respository";

type StoreExtraArg = {
  authRepo: IAuthRepository,
  userRepo: IUserRepository,
  searchRepo: ISearchRepository,
  friendRepo: IFriendRepository,
  badgeRepo: IBadgeRepository,
  blockRepo: IBlockRepository,
  notificationRepo: INotificationRepository,
};

export default StoreExtraArg;

