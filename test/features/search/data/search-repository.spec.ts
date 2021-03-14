import {anything, instance, mock, verify, when} from "ts-mockito";
import {IUserAPI} from "../../../../src/features/user/data/sources/user-api";
import {SearchRepository} from "../../../../src/features/search/data/search-repository";
import {expect, it} from "@jest/globals";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import {SearchError} from "../../../../src/features/search/types/search-error";
import {mockUser} from "../../../mock-objects";

const MockUserAPI = mock<IUserAPI>();
const searchRepo = new SearchRepository(instance(MockUserAPI));

describe('error catching', () => {
  const act = (error: Error) => {
    return (searchRepo as SearchRepository)._leftOrRight(() => {
      throw error;
    });
  };

  it('should return network errors', async () => {
    // arrange
    const networkError = new ApolloError({errorMessage: 'LOL'});
    // act
    const result = await act(networkError);
    // assert
    expect(result).toStrictEqual(left(SearchError.network));
  });

  it('should return general errors', async () => {
    // arrange
    const generalError = new Error('LMAO');
    // act
    const result = await act(generalError);
    // assert
    expect(result).toStrictEqual(left(SearchError.general));
  });
});

describe('findUsers', () => {
  it('should find users duh', async () => {
    // arrange
    const searchQuery = 'search queryyyyyyy';
    when(MockUserAPI.findUsers(anything())).thenResolve([mockUser]);
    // act
    const result = await searchRepo.findUsers(searchQuery);
    // assert
    expect(result).toStrictEqual(right([mockUser]));
    verify(MockUserAPI.findUsers(searchQuery)).once();
  });
});