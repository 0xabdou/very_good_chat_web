import IAuthRepository from "../features/auth/data/auth-repository";
import {IUserRepository} from "../features/user/data/user-repository";
import {ISearchRepository} from "../features/search/data/search-repository";

type StoreExtraArg = {
  authRepo: IAuthRepository,
  userRepo: IUserRepository,
  searchRepo: ISearchRepository,
};

export default StoreExtraArg;

