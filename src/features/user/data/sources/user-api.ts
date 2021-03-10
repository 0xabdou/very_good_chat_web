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

export class FakeUserApi implements IUserAPI {
  async getCurrentUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => reject('user_not_found'), 1000);
    });
  }

  async getGoogleUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: '1063557684670-rfkmbsckud2puhj9iac1g5ttdbph5jtt.apps.googleusercontent.com',
          scope: 'profile',
        }).then(async (ga) => {
          const user = ga.currentUser.get();
          const profile = user.getBasicProfile();
          const firstName = profile.getGivenName();
          const lastName = profile.getFamilyName();
          const x = {
            id: user.getId(),
            username: `${firstName[0]}_${lastName}`,
            name: `${firstName} ${lastName}`,
            photoURL: profile.getImageUrl(),
          };
          resolve(x);
        }).catch(reject);
      });
    });
  }

  async createUser(creation: UserCreation): Promise<User> {
    await new Promise(resolve => setTimeout(() => resolve(null), 1000));
    if (creation.username == 'taken')
      throw 'username_taken';
    if (creation.username == 'general')
      throw 'general_error';
    if (creation.username == 'network')
      throw 'network_error';
    const defaultUser = await this.getGoogleUser();
    let photo: string | undefined;
    if (creation.photo)
      photo = URL.createObjectURL(creation.photo);
    return {
      id: defaultUser.id,
      username: creation.username,
      name: creation.name ?? defaultUser.name,
      photoURL: photo ?? defaultUser.photoURL,
    };
  }

  isUsernameTaken(username: string): Promise<boolean> {
    return Promise.resolve(false);
  }

}