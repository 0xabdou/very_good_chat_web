import User, {Me, UserCreation, UserUpdate} from "../../types/user";
import {ApolloClient} from "@apollo/client";
import {
  MeQuery,
  MeQuery_me,
  MeQuery_me_user
} from "../../../../_generated/MeQuery";
import {
  FIND_USERS_QUERY,
  ME_QUERY,
  REGISTER_MUTATION,
  UPDATE_ACTIVE_STATUS,
  UPDATE_LAST_SEEN,
  UPDATE_USER_MUTATION,
  USERNAME_EXISTENCE_QUERY
} from "../graphql";
import {
  UsernameExistenceQuery,
  UsernameExistenceQueryVariables
} from "../../../../_generated/UsernameExistenceQuery";
import {
  FindUsersQuery,
  FindUsersQueryVariables
} from "../../../../_generated/FindUsersQuery";
import {CreateMe, CreateMeVariables} from "../../../../_generated/CreateMe";
import {UpdateMe, UpdateMeVariables} from "../../../../_generated/UpdateMe";
import {
  UpdateActiveStatus,
  UpdateActiveStatusVariables
} from "../../../../_generated/UpdateActiveStatus";
import {UpdateLastSeen} from "../../../../_generated/UpdateLastSeen";

export interface IUserAPI {
  getMe(): Promise<Me>;

  createMe(creation: UserCreation): Promise<Me>;

  updateMe(update: UserUpdate): Promise<Me>;

  isUsernameTaken(username: string): Promise<boolean>;

  findUsers(searchQuery: string): Promise<User[]>

  updateActiveStatus(activeStatus: boolean): Promise<boolean>;

  updateLastSeen(): Promise<number>;
}

export class UserAPI implements IUserAPI {
  private _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async createMe(creation: UserCreation): Promise<Me> {
    const {data} = await this._client.mutate<CreateMe, CreateMeVariables>({
      mutation: REGISTER_MUTATION,
      variables: {registerInput: creation},
    });
    return UserAPI.parseMe(data?.register!);
  }

  async updateMe(update: UserUpdate): Promise<Me> {
    const {data} = await this._client.mutate<UpdateMe, UpdateMeVariables>({
      mutation: UPDATE_USER_MUTATION,
      variables: {updateUserInput: update},
    });
    return UserAPI.parseMe(data?.updateUser!);
  }

  async getMe(): Promise<Me> {
    const {data: {me}} = await this._client.query<MeQuery>({
      query: ME_QUERY
    });
    return UserAPI.parseMe(me);
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

  async updateActiveStatus(activeStatus: boolean): Promise<boolean> {
    const {data} = await this._client.mutate<UpdateActiveStatus, UpdateActiveStatusVariables>({
      mutation: UPDATE_ACTIVE_STATUS,
      variables: {activeStatus}
    });
    return data?.updateActiveStatus!;
  }

  async updateLastSeen(): Promise<number> {
    const {data} = await this._client.mutate<UpdateLastSeen>({
      mutation: UPDATE_LAST_SEEN
    });
    return data?.updateLastSeen;
  }

  static parseUser(user: MeQuery_me_user): User {
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

  static parseMe(me: MeQuery_me): Me {
    return {
      ...this.parseUser(me.user),
      activeStatus: me.activeStatus
    };
  }
}