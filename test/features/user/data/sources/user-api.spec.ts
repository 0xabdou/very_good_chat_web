import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import {
  IUserAPI,
  UserAPI
} from "../../../../../src/features/user/data/sources/user-api";
import {describe} from "@jest/globals";
import {
  FIND_USERS_QUERY,
  ME_QUERY,
  REGISTER_MUTATION,
  UPDATE_ACTIVE_STATUS,
  UPDATE_LAST_SEEN,
  UPDATE_USER_MUTATION,
  USERNAME_EXISTENCE_QUERY
} from "../../../../../src/features/user/data/graphql";
import {
  mockGQLMe,
  mockGQLUser,
  mockMe,
  mockUser,
  mockUserCreation,
  mockUserUpdate
} from "../../../../mock-objects";
import {MeQuery} from "../../../../../src/_generated/MeQuery";
import {
  UsernameExistenceQuery,
  UsernameExistenceQueryVariables
} from "../../../../../src/_generated/UsernameExistenceQuery";

import {
  FindUsersQuery,
  FindUsersQueryVariables
} from "../../../../../src/_generated/FindUsersQuery";
import {
  CreateMe,
  CreateMeVariables
} from "../../../../../src/_generated/CreateMe";
import {
  UpdateMe,
  UpdateMeVariables
} from "../../../../../src/_generated/UpdateMe";
import {UpdateActiveStatus} from "../../../../../src/_generated/UpdateActiveStatus";
import {UpdateLastSeen} from "../../../../../src/_generated/UpdateLastSeen";

const MockApolloClient = mock<ApolloClient<any>>();
const userAPI: IUserAPI = new UserAPI(instance(MockApolloClient));

describe('createMe', () => {
  it('should return the created user on success', async () => {
    // arrange
    const registerInput = mockUserCreation;
    when(MockApolloClient.mutate<CreateMe, CreateMeVariables>(
      deepEqual({
        mutation: REGISTER_MUTATION,
        variables: {registerInput},
      }))).thenResolve({
      data: {register: mockGQLMe}
    });
    // act
    const result = await userAPI.createMe(mockUserCreation);
    // assert
    expect(result).toMatchObject(mockMe);
    verify(MockApolloClient.mutate(deepEqual(
      {mutation: REGISTER_MUTATION, variables: {registerInput}}
    ))).once();
  });
});

describe('updateMe', () => {
  it('should return the updated user on success', async () => {
    // arrange
    const updateUserInput = mockUserUpdate;
    when(MockApolloClient.mutate <UpdateMe, UpdateMeVariables>(
      deepEqual({
        mutation: UPDATE_USER_MUTATION,
        variables: {updateUserInput},
      }))).thenResolve({
      data: {updateUser: mockGQLMe}
    });
    // act
    const result = await userAPI.updateMe(mockUserUpdate);
    // assert
    expect(result).toMatchObject(mockMe);
    verify(MockApolloClient.mutate(deepEqual(
      {mutation: UPDATE_USER_MUTATION, variables: {updateUserInput}}
    ))).once();
  });
});

describe('getMe', () => {
  it('should return the current user', async () => {
    // arrange
    when(MockApolloClient.query<MeQuery>(deepEqual({query: ME_QUERY})))
      .thenResolve({data: {me: mockGQLMe}} as ApolloQueryResult<MeQuery>);
    // act
    const result = await userAPI.getMe();
    // assert
    expect(result).toMatchObject(mockMe);
    verify(MockApolloClient.query(deepEqual({query: ME_QUERY}))).once();
  });
});

describe('isUsernameTaken', () => {
  it('should return a the username existence status', async () => {
    // arrange
    const username = 'weird_username';
    when(MockApolloClient.query
      < UsernameExistenceQuery, UsernameExistenceQueryVariables >
      (deepEqual({
        query: USERNAME_EXISTENCE_QUERY,
        variables: {username}
      }))
    ).thenResolve({
      data: {checkUsernameExistence: true}
    } as ApolloQueryResult<UsernameExistenceQuery>);
    // act
    const result = await userAPI.isUsernameTaken(username);
    // assert
    expect(result).toStrictEqual(true);
    verify(MockApolloClient.query(
      deepEqual({query: USERNAME_EXISTENCE_QUERY, variables: {username}}))
    ).once();
  });
});

describe('findUsers', () => {
  it('should return a list of users', async () => {
    // arrange
    const searchQuery = 'search query';
    when(MockApolloClient.query(anything())).thenResolve({
      data: {findUsers: [mockGQLUser]}
    } as ApolloQueryResult<FindUsersQuery>);
    // act
    const result = await userAPI.findUsers(searchQuery);
    verify(MockApolloClient.query<FindUsersQuery, FindUsersQueryVariables>(deepEqual({
      query: FIND_USERS_QUERY,
      variables: {findUsersSearchQuery: searchQuery},
    }))).once();
    expect(result[0]).toMatchObject(mockUser);
  });
});

describe('updateActiveStatus', () => {
  it('should update the active status', async () => {
    // arrange
    const status = true;
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {updateActiveStatus: status}
    } as ApolloQueryResult<UpdateActiveStatus>);
    // act
    const result = await userAPI.updateActiveStatus(status);
    // assert
    expect(result).toBe(status);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: UPDATE_ACTIVE_STATUS, variables: {activeStatus: status}
    }))).once();
  });
});

describe('updateLastSeen', () => {
  it('should update the active status', async () => {
    // arrange
    const lastSeen = new Date().getTime();
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {updateLastSeen: lastSeen}
    } as ApolloQueryResult<UpdateLastSeen>);
    // act
    const result = await userAPI.updateLastSeen();
    // assert
    expect(result).toBe(lastSeen);
    verify(MockApolloClient.mutate(deepEqual({mutation: UPDATE_LAST_SEEN})))
      .once();
  });
});
