import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import BlockAPI from "../../../../../src/features/block/data/sources/block-api";
import {
  BlockMutation,
  BlockMutationVariables
} from "../../../../../src/_generated/BlockMutation";
import {mockBlock, mockGQLBlock} from "../../../../mock-objects";
import {
  BLOCK,
  GET_BLOCKED_USERS,
  UNBLOCK
} from "../../../../../src/features/block/data/graphql";
import {Unblock, UnblockVariables} from "../../../../../src/_generated/Unblock";
import {GetBlockedUsers} from "../../../../../src/_generated/GetBlockedUsers";

const MockApolloClient = mock<ApolloClient<any>>();
const blockedID = 'blockeddddddddd';

const blockAPI = new BlockAPI(instance(MockApolloClient));

describe('block', () => {
  it('should block the user and return a block object', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {block: mockGQLBlock}
    } as ApolloQueryResult<BlockMutation>);
    // act
    const result = await blockAPI.block(blockedID);
    // assert
    expect(result).toStrictEqual(mockBlock);
    verify(MockApolloClient.mutate<BlockMutation, BlockMutationVariables>(deepEqual({
      mutation: BLOCK, variables: {blockedID}
    }))).once();
  });
});

describe('unblock', () => {
  it('should unblock the user and return his id', async () => {
    // arrange
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {unblock: blockedID}
    } as ApolloQueryResult<Unblock>);
    // act
    const result = await blockAPI.unblock(blockedID);
    // assert
    expect(result).toBe(blockedID);
    verify(MockApolloClient.mutate<Unblock, UnblockVariables>(deepEqual({
      mutation: UNBLOCK, variables: {blockedID}
    }))).once();
  });
});

describe('getBlockedUser', () => {
  it('should a list of blocks', async () => {
    // arrange
    when(MockApolloClient.query(anything())).thenResolve({
      data: {getBlockedUsers: [mockGQLBlock]}
    } as ApolloQueryResult<GetBlockedUsers>);
    // act
    const result = await blockAPI.getBlockedUsers();
    // assert
    expect(result).toStrictEqual([mockBlock]);
    verify(MockApolloClient.query(deepEqual({
      query: GET_BLOCKED_USERS,
      fetchPolicy: 'no-cache'
    }))).once();
  });
});