import User, {UserCreation, UserUpdate} from "../../types/user";
import {ApolloClient} from "@apollo/client";
import {MeQuery} from "../../../../_generated/MeQuery";
import {
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
  UsernameExistenceMutation,
  UsernameExistenceMutationVariables
} from "../../../../_generated/UsernameExistenceMutation";
import {
  UpdateUserMutation,
  UpdateUserMutationVariables
} from "../../../../_generated/UpdateUserMutation";

export interface IUserAPI {
  getCurrentUser(): Promise<User>;

  createUser(creation: UserCreation): Promise<User>;

  updateUser(update: UserUpdate): Promise<User>;

  isUsernameTaken(username: string): Promise<boolean>;
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
    return data?.register!;
  }

  async updateUser(update: UserUpdate): Promise<User> {
    const {data} = await this._client.mutate<UpdateUserMutation,
      UpdateUserMutationVariables>({
      mutation: UPDATE_USER_MUTATION,
      variables: {updateUserInput: update},
    });
    return data?.updateUser!;
  }

  async getCurrentUser(): Promise<User> {
    const {data: {me}} = await this._client.query<MeQuery>({
      query: ME_QUERY
    });
    return me;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const {data} = await this._client.query<UsernameExistenceMutation,
      UsernameExistenceMutationVariables>({
      query: USERNAME_EXISTENCE_QUERY,
      variables: {username}
    });

    return data.checkUsernameExistence!;
  }
}