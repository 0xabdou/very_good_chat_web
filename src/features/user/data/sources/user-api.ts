import User, {UserCreation} from "../../types/user";
import {ApolloClient} from "@apollo/client";
import {MeQuery} from "../../../../_generated/MeQuery";
import {
  ME_QUERY,
  REGISTER_MUTATION,
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

export interface IUserAPI {
  getCurrentUser(): Promise<User>;

  createUser(creation: UserCreation): Promise<User>;

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
    const user = data?.register!;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      photoURL: user.photoURL,
    };
  }

  async getCurrentUser(): Promise<User> {
    const {data: {me}} = await this._client.query<MeQuery>({
      query: ME_QUERY
    });
    return {
      id: me.id,
      username: me.username,
      name: me.name,
      photoURL: me.photoURL,
    };
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