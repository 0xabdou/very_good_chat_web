import User, {Me, UserCreation, UserUpdate} from "../../types/user";
import {ApolloClient} from "@apollo/client";
import {MeQuery, MeQuery_me_user} from "../../../../_generated/MeQuery";
import {
  FIND_USERS_QUERY,
  ME_QUERY,
  REGISTER_MUTATION,
  UPDATE_USER_MUTATION,
  USERNAME_EXISTENCE_QUERY
} from "../graphql";
import {
  RegisterMutation,
  RegisterMutationVariables
} from "../../../../_generated/RegisterMutation";
import {
  UsernameExistenceQuery,
  UsernameExistenceQueryVariables
} from "../../../../_generated/UsernameExistenceQuery";
import {
  UpdateUserMutation,
  UpdateUserMutationVariables
} from "../../../../_generated/UpdateUserMutation";
import {
  FindUsersQuery,
  FindUsersQueryVariables
} from "../../../../_generated/FindUsersQuery";

export interface IUserAPI {
  getCurrentUser(): Promise<Me>;

  createUser(creation: UserCreation): Promise<User>;

  updateUser(update: UserUpdate): Promise<User>;

  isUsernameTaken(username: string): Promise<boolean>;

  findUsers(searchQuery: string): Promise<User[]>
}

export class UserAPI implements IUserAPI {
  private _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async createUser(creation: UserCreation): Promise<User> {
    const {data} = await this._client.mutate<RegisterMutation,
      RegisterMutationVariables>({
      mutation: REGISTER_MUTATION,
      variables: {registerInput: creation},
    });
    const user = data?.register!;
    return {
      ...user,
      photo: {
        source: user.photoURLSource!,
        medium: user.photoURLMedium!,
        small: user.photoURLSmall!
      }
    };
  }

  async updateUser(update: UserUpdate): Promise<User> {
    const {data} = await this._client.mutate<UpdateUserMutation,
      UpdateUserMutationVariables>({
      mutation: UPDATE_USER_MUTATION,
      variables: {updateUserInput: update},
    });
    return UserAPI.parseUser(data?.updateUser!);
  }

  async getCurrentUser(): Promise<Me> {
    const {data: {me}} = await this._client.query<MeQuery>({
      query: ME_QUERY
    });
    return {
      ...UserAPI.parseUser(me.user),
      activeStatus: me.activeStatus
    };
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const {data} = await this._client.query<UsernameExistenceQuery,
      UsernameExistenceQueryVariables>({
      query: USERNAME_EXISTENCE_QUERY,
      variables: {username}
    });
    return data.checkUsernameExistence;
  }

  async findUsers(searchQuery: string): Promise<User[]> {
    const {data} = await this._client.query<FindUsersQuery,
      FindUsersQueryVariables>({
      query: FIND_USERS_QUERY,
      variables: {findUsersSearchQuery: searchQuery}
    });
    return data.findUsers.map(user => UserAPI.parseUser(user));
  }

  static parseUser(user: MeQuery_me_user) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      photo: {
        source: user.photoURLSource!,
        medium: user.photoURLMedium!,
        small: user.photoURLSmall!
      }
    };
  }
}