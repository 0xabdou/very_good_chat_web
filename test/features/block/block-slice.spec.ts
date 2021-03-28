import StoreExtraArg from "../../../src/store/store-extra-arg";
import {getMockStore, mockBlock} from "../../mock-objects";
import reducer, {
  blockActions,
  BlockState,
  initialBlockState
} from "../../../src/features/block/block-slice";
import {instance, mock, reset, verify, when} from "ts-mockito";
import {IBlockRepository} from "../../../src/features/block/data/block-respository";
import {left, right} from "fp-ts/Either";
import BlockError from "../../../src/features/block/types/block-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {Block} from "../../../src/features/block/types/block";

const MockBlockRepo = mock<IBlockRepository>();
const mockStore = getMockStore()();
const extra = {
  blockRepo: instance(MockBlockRepo)
} as StoreExtraArg;
const blocks = [mockBlock];
const blockError = BlockError.network;

const {getBlockedUsers} = blockActions;

beforeEach(() => {
  reset(MockBlockRepo);
});

describe('getBlockedUsers', () => {
  const act = () => getBlockedUsers()(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockBlockRepo.getBlockedUsers()).thenResolve(right(blocks));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getBlockedUsers.fulfilled.type);
    expect(result.payload).toStrictEqual(blocks);
    verify(MockBlockRepo.getBlockedUsers()).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockBlockRepo.getBlockedUsers()).thenResolve(left(blockError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getBlockedUsers.rejected.type);
    expect(result.payload).toStrictEqual(blockError);
    verify(MockBlockRepo.getBlockedUsers()).once();
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const inputState: BlockState = {...initialBlockState, error: blockError};
      const outputState: BlockState = {...initialBlockState};
      const action: PayloadAction = {
        type: getBlockedUsers.pending.type,
        payload: undefined
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const inputState: BlockState = {...initialBlockState};
      const outputState: BlockState = {...initialBlockState, blocks};
      const action: PayloadAction<Block[]> = {
        type: getBlockedUsers.fulfilled.type,
        payload: blocks
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if rejected', () => {
      // arrange
      const inputState: BlockState = {...initialBlockState};
      const outputState: BlockState = {...initialBlockState, error: blockError};
      const action: PayloadAction<BlockError> = {
        type: getBlockedUsers.rejected.type,
        payload: blockError
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});
