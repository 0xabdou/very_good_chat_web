import IAuthRepository from "../features/auth/data/auth-repository";
import {IUserRepository} from "../features/user/data/user-repository";

type StoreExtraArg = {
  authRepository: IAuthRepository,
  userRepository: IUserRepository,
};

export default StoreExtraArg;

