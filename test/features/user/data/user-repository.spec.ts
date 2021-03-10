import {IUserAPI} from "../../../../src/features/user/data/sources/user-api";
import {instance, mock, reset, verify, when} from "ts-mockito";
import {
  IUserRepository,
  UserRepository
} from "../../../../src/features/user/data/user-repository";
import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals";
import {left, right} from "fp-ts/Either";
import {mockUser, mockUserCreation} from "../../../mock-objects";
import {ApolloError} from "@apollo/client";
import UserError from "../../../../src/features/user/types/user-error";
import {GraphQLError} from "graphql";

const MockUserApi = mock<IUserAPI>();
const userRepo: IUserRepository = new UserRepository(instance(MockUserApi));


beforeEach(() => {
  reset(MockUserApi);
});

describe('error catching', () => {
  const act = (error: Error) => {
    return (userRepo as UserRepository).leftOrRight(() => {
      throw error;
    });
  };

  it('should return network errors', async () => {
    // arrange
    const networkError = new ApolloError({errorMessage: 'LOL'});
    // act
    const result = await act(networkError);
    // assert
    expect(result).toStrictEqual(left(UserError.network));
  });

  it('should return userNotFound errors', async () => {
    // arrange
    const gqlError = new GraphQLError(
      'User not found',
      undefined, undefined, undefined, undefined, undefined,
      {code: UserRepository.ERROR_USER_NOT_FOUND}
    );
    const notFoundError = new ApolloError({
      errorMessage: 'User not found',
      graphQLErrors: [gqlError]
    });
    // act
    const result = await act(notFoundError);
    // assert
    expect(result).toStrictEqual(left(UserError.notFound));
  });

  it('should return usernameTaken errors', async () => {
    // arrange
    const usernameTakenError = new Error('Username taken');
    usernameTakenError.name = UserRepository.ERROR_USERNAME_TAKEN;
    // act
    const result = await act(usernameTakenError);
    // assert
    expect(result).toStrictEqual(left(UserError.usernameTaken));
  });
});

describe('getCurrentUser()', () => {
  it('should return a user on success', async () => {
    when(MockUserApi.getCurrentUser()).thenResolve(mockUser);
    const result = await userRepo.getCurrentUser();
    expect(result).toStrictEqual(right(mockUser));
    verify(MockUserApi.getCurrentUser()).once();
  });
});

describe('createUser()', () => {

  beforeAll(() => {
    when(MockUserApi.isUsernameTaken(mockUserCreation.username))
      .thenResolve(false);
  });

  it('should check username existence', async () => {
    // act
    await userRepo.createUser(mockUserCreation);
    // assert
    verify(MockUserApi.isUsernameTaken(mockUserCreation.username)).once();
  });

  it('should return usernameTaken error if the username is taken', async () => {
    // arrange
    when(MockUserApi.isUsernameTaken(mockUserCreation.username))
      .thenResolve(true);
    // act
    const result = await userRepo.createUser(mockUserCreation);
    // assert
    expect(result).toStrictEqual(left(UserError.usernameTaken));
  });

  it('should return a user on success',
    async () => {
      when(MockUserApi.createUser(mockUserCreation)).thenResolve(mockUser);
      const result = await userRepo.createUser(mockUserCreation);
      expect(result).toStrictEqual(right(mockUser));
      verify(MockUserApi.createUser(mockUserCreation)).once();
    }
  );
});