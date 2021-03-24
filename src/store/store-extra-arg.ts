import IAuthRepository from "../features/auth/data/auth-repository";
import {IUserRepository} from "../features/user/data/user-repository";
import {ISearchRepository} from "../features/search/data/search-repository";
import {IFriendRepository} from "../features/friend/data/friend-repository";
import {IBadgeRepository} from "../features/badge/data/badge-repository";

type StoreExtraArg = {
  authRepo: IAuthRepository,
  userRepo: IUserRepository,
  searchRepo: ISearchRepository,
  friendRepo: IFriendRepository,
  badgeRepo: IBadgeRepository
};

export default StoreExtraArg;

