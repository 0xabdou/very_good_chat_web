import {IUserAPI} from "../../../../src/features/user/data/sources/user-api";
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {
  IMeRepository,
  MeRepository
} from "../../../../src/features/user/data/me-repository";
import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals";
import {left, right} from "fp-ts/Either";
import {mockMe, mockUserCreation, mockUserUpdate} from "../../../mock-objects";
import {ApolloError} from "@apollo/client";
import UserError from "../../../../src/features/user/types/user-error";
import {GraphQLError} from "graphql";
import {UserUpdate} from "../../../../src/features/user/types/user";

const MockUserAPI = mock<IUserAPI>();
const meRepo: IMeRepository = new MeRepository(instance(MockUserAPI));


beforeEach(() => {
  reset(MockUserAPI);
});

describe('error catching', () => {
  const act = (error: Error) => {
    return (meRepo as MeRepository)._leftOrRight(() => {
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
      {code: MeRepository.ERROR_USER_NOT_FOUND}
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
    usernameTakenError.name = MeRepository.ERROR_USERNAME_TAKEN;
    // act
    const result = await act(usernameTakenError);
    // assert
    expect(result).toStrictEqual(left(UserError.usernameTaken));
  });
});

describe('getCurrentUser()', () => {
  it('should return a user on success', async () => {
    when(MockUserAPI.getMe()).thenResolve(mockMe);
    const result = await meRepo.getMe();
    expect(result).toStrictEqual(right(mockMe));
    verify(MockUserAPI.getMe()).once();
  });
});

describe('createUser()', () => {
  beforeAll(() => {
    when(MockUserAPI.isUsernameTaken(mockUserCreation.username))
      .thenResolve(false);
  });

  it('should check username existence', async () => {
    // act
    await meRepo.createMe(mockUserCreation);
    // assert
    verify(MockUserAPI.isUsernameTaken(mockUserCreation.username)).once();
  });

  it('should return usernameTaken error if the username is taken', async () => {
    // arrange
    when(MockUserAPI.isUsernameTaken(mockUserCreation.username))
      .thenResolve(true);
    // act
    const result = await meRepo.createMe(mockUserCreation);
    // assert
    expect(result).toStrictEqual(left(UserError.usernameTaken));
  });

  it('should return a user on success',
    async () => {
      when(MockUserAPI.createMe(mockUserCreation)).thenResolve(mockMe);
      const result = await meRepo.createMe(mockUserCreation);
      expect(result).toStrictEqual(right(mockMe));
      verify(MockUserAPI.createMe(mockUserCreation)).once();
    }
  );
});

describe('updateUser()', () => {
  beforeEach(() => {
    when(MockUserAPI.isUsernameTaken(anything()))
      .thenResolve(false);
    when(MockUserAPI.updateMe(anything())).thenResolve(mockMe);
  });

  it('should not check username existence if it was not there', async () => {
    // arrange
    const update: UserUpdate = {
      ...mockUserUpdate,
      username: undefined,
    };
    // act
    await meRepo.updateMe(update);
    // assert
    verify(MockUserAPI.isUsernameTaken(anything())).never();
  });

  it('should check username existence if there is one', async () => {
    // act
    await meRepo.updateMe(mockUserUpdate);
    // assert
    verify(MockUserAPI.isUsernameTaken(mockUserUpdate.username!)).once();
  });

  it('should return usernameTaken error if the username is taken', async () => {
    // arrange
    when(MockUserAPI.isUsernameTaken(mockUserCreation.username))
      .thenResolve(true);
    // act
    const result = await meRepo.updateMe(mockUserUpdate);
    // assert
    expect(result).toStrictEqual(left(UserError.usernameTaken));
  });

  it('should return a user on success', async () => {
      // act
      const result = await meRepo.updateMe(mockUserUpdate);
      // assert
      expect(result).toStrictEqual(right(mockMe));
      verify(MockUserAPI.updateMe(mockUserUpdate)).once();
    }
  );
});

describe('updateActiveStatus', () => {
  it('should update active status', async () => {
    // arrange
    const status = true;
    when(MockUserAPI.updateActiveStatus(anything())).thenResolve(status);
    // act
    const result = await meRepo.updateActiveStatus(status);
    // assert
    expect(result).toStrictEqual(right(status));
    verify(MockUserAPI.updateActiveStatus(status)).once();
  });
});

describe('updateLastSeen', () => {
  it('should last seen', async () => {
    // arrange
    const lastSeen = new Date().getTime();
    when(MockUserAPI.updateLastSeen()).thenResolve(lastSeen);
    // act
    const result = await meRepo.updateLastSeen();
    // assert
    expect(result).toStrictEqual(right(lastSeen));
    verify(MockUserAPI.updateLastSeen()).once();
  });
});