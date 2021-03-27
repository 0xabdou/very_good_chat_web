import {anything, instance, mock, verify, when} from "ts-mockito";
import BlockAPI from "../../../src/features/block/data/sources/block-api";
import BlockRepository
  from "../../../src/features/block/data/block-respository";
import BlockError from "../../../src/features/block/types/block-error";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import {getApolloError, mockBlock} from "../../mock-objects";

const MockBlockAPI = mock<BlockAPI>();
const blockedID = 'blockeeeeeeddddd';

const blockRepo = new BlockRepository(instance(MockBlockAPI));

describe('error catching', () => {
  const act = (error: Error) => blockRepo._leftOrRight(() => {
    throw error;
  });

  it('should catch network errors', async () => {
    // act
    const result = await act(new ApolloError({errorMessage: 'yup'}));
    // assert
    expect(result).toStrictEqual(left(BlockError.network));
  });

  it('should catch general errors', async () => {
    // act
    const result = await act(getApolloError('SOME_CODE'));
    // assert
    expect(result).toStrictEqual(left(BlockError.general));
  });
});

describe('block', () => {
  it('should block the user and return a block object', async () => {
    // arrange
    when(MockBlockAPI.block(anything())).thenResolve(mockBlock);
    // act
    const result = await blockRepo.block(blockedID);
    // assert
    expect(result).toStrictEqual(right(mockBlock));
    verify(MockBlockAPI.block(blockedID)).once();
  });
});

describe('unblock', () => {
  it('should unblock the user and return his ID', async () => {
    // arrange
    when(MockBlockAPI.unblock(anything())).thenResolve(blockedID);
    // act
    const result = await blockRepo.unblock(blockedID);
    // assert
    expect(result).toStrictEqual(right(blockedID));
    verify(MockBlockAPI.block(blockedID)).once();
  });
});

describe('getBlockedUser', () => {
  it('should return a list of blocks', async () => {
    // arrange
    when(MockBlockAPI.getBlockedUsers()).thenResolve([mockBlock]);
    // act
    const result = await blockRepo.getBlockedUsers();
    // assert
    expect(result).toStrictEqual(right([mockBlock]));
    verify(MockBlockAPI.getBlockedUsers()).once();
  });
});
