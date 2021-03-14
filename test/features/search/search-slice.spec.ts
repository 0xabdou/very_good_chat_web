import reducer, {
  initialSearchState,
  searchActions
} from '../../../src/features/search/search-slice';
import {getMockStore, mockUser} from "../../mock-objects";
import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";
import {ISearchRepository} from "../../../src/features/search/data/search-repository";
import StoreExtraArg from "../../../src/store/store-extra-arg";
import {left, right} from "fp-ts/Either";
import {SearchError} from "../../../src/features/search/types/search-error";
import {PayloadAction} from "@reduxjs/toolkit";
import User from "../../../src/features/user/types/user";

const {searchForUsers} = searchActions;
const mockStore = getMockStore()();
const MockSearchRepository = mock<ISearchRepository>();
const extraArg = {
 searchRepo: instance(MockSearchRepository),
} as StoreExtraArg;

beforeEach(() => {
  resetCalls(MockSearchRepository);
});

describe('searchForUsers', () => {
  const searchQuery = 'searchQUeryyyyyyyy :)';
  const act = () => searchForUsers(searchQuery)(
    mockStore.dispatch,
    mockStore.getState,
    extraArg,
  );

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockSearchRepository.findUsers(anything()))
      .thenResolve(right([mockUser]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(searchForUsers.fulfilled.type);
    expect(result.payload).toStrictEqual([mockUser]);
    verify(MockSearchRepository.findUsers(searchQuery)).once();
  });

  it('should return the right action if rejected', async () => {
    // arrange
    when(MockSearchRepository.findUsers(anything()))
      .thenResolve(left(SearchError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(searchForUsers.rejected.type);
    expect(result.payload).toStrictEqual(SearchError.network);
    verify(MockSearchRepository.findUsers(searchQuery)).once();
  });

  describe('reducers', () => {
    const initialState = initialSearchState;
    const loadingState = {...initialState, loading: true}

    it('pending reducer should return the right state', async ()  => {
      // arrange
      const searchQuery = 'akjdhklsjk';
      const action :PayloadAction<undefined, string, {arg: string}> = {
        type: searchForUsers.pending.type,
        payload: undefined,
        meta: {arg: searchQuery}
      };
      // act
      const result = reducer(initialState, action);
      // assert
      expect(result).toStrictEqual({...loadingState, searchQuery});
    });

    it('fulfilled reducer should return the right state', async ()  => {
      // arrange
      const action :PayloadAction<User[]> = {
        type: searchForUsers.fulfilled.type,
        payload: [mockUser],
      };
      // act
      const result = reducer(loadingState, action);
      // assert
      expect(result).toStrictEqual({
        ...loadingState,
        loading: false,
        results: [mockUser],
      });
    });

    it('rejected reducer should return the right state', async ()  => {
      // arrange
      const action :PayloadAction<SearchError> = {
        type: searchForUsers.rejected.type,
        payload: SearchError.network,
      };
      // act
      const result = reducer(loadingState, action);
      // assert
      expect(result).toStrictEqual({
        ...loadingState,
        loading: false,
        error: SearchError.network
      });
    });
  });
});