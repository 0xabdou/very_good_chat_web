import {Block} from "../../types/block";
import {ApolloClient} from "@apollo/client";
import {
  BlockMutation,
  BlockMutationVariables
} from "../../../../_generated/BlockMutation";
import {BLOCK, GET_BLOCKED_USERS, UNBLOCK} from "../graphql";
import {UserAPI} from "../../../user/data/sources/user-api";
import {Unblock, UnblockVariables} from "../../../../_generated/Unblock";
import {GetBlockedUsers} from "../../../../_generated/GetBlockedUsers";

export interface IBlockAPI {
  block(blockedID: string): Promise<Block>;

  unblock(blockedID: string): Promise<string>;

  getBlockedUsers(): Promise<Block[]>;
}

export default class BlockAPI implements IBlockAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async block(blockedID: string): Promise<Block> {
    const {data} = await this._client.mutate<BlockMutation, BlockMutationVariables>({
      mutation: BLOCK,
      variables: {blockedID}
    });
    const block = data?.block!;
    return {
      user: UserAPI.parseUser(block.user!),
      date: block.date
    };
  }

  async unblock(blockedID: string): Promise<string> {
    const {data} = await this._client.mutate<Unblock, UnblockVariables>({
      mutation: UNBLOCK,
      variables: {blockedID}
    });
    return data?.unblock!;
  }

  async getBlockedUsers(): Promise<Block[]> {
    const {data} = await this._client.query<GetBlockedUsers>({
      query: GET_BLOCKED_USERS
    });
    return data.getBlockedUsers.map(block => {
      return {
        user: UserAPI.parseUser(block.user!),
        date: block.date
      };
    });
  }
}