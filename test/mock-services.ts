import {instance, mock, reset} from "ts-mockito";
import IAuthRepository from "../src/features/auth/data/auth-repository";
import {IUserRepository} from "../src/features/user/data/user-repository";
import StoreExtraArg from "../src/store/store-extra-arg";

const mocks: StoreExtraArg = {
  authRepository: mock<IAuthRepository>(),
  userRepository: mock<IUserRepository>(),
};

const instances: StoreExtraArg = {
  authRepository: instance(mocks.authRepository),
  userRepository: instance(mocks.userRepository),
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