import {anything, deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import {
  IUserAPI,
  UserAPI
} from "../../../../../src/features/user/data/sources/user-api";
import {describe} from "@jest/globals";
import {
  RegisterMutation,
  RegisterMutationVariables
} from "../../../../../src/_generated/RegisterMutation";
import {
  FIND_USERS_QUERY,
  ME_QUERY,
  REGISTER_MUTATION,
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
  UpdateUserMutation,
  UpdateUserMutationVariables
} from "../../../../../src/_generated/UpdateUserMutation";
import {
  FindUsersQuery,
  FindUsersQueryVariables
} from "../../../../../src/_generated/FindUsersQuery";

const MockApolloClient = mock<ApolloClient<any>>();
const userAPI: IUserAPI = new UserAPI(instance(MockApolloClient));

describe('createUser', () => {
  it('should return the created user on success', async () => {
    // arrange
    const registerInput = mockUserCreation;
    when(MockApolloClient.mutate<RegisterMutation, RegisterMutationVariables>(
      deepEqual({
        mutation: REGISTER_MUTATION,
        variables: {registerInput},
      }))).thenResolve({
      data: {register: mockGQLUser}
    });
    // act
    const result = await userAPI.createUser(mockUserCreation);
    // assert
    expect(result).toMatchObject(mockUser);
    verify(MockApolloClient.mutate(deepEqual(
      {mutation: REGISTER_MUTATION, variables: {registerInput}}
    ))).once();
  });
});

describe('updateUser', () => {
  it('should return the updated user on success', async () => {
    // arrange
    const updateUserInput = mockUserUpdate;
    when(MockApolloClient.mutate
      < UpdateUserMutation, UpdateUserMutationVariables > (
      deepEqual({
        mutation: UPDATE_USER_MUTATION,
        variables: {updateUserInput},
      }))).thenResolve({
      data: {updateUser: mockGQLUser}
    });
    // act
    const result = await userAPI.updateUser(mockUserUpdate);
    // assert
    expect(result).toMatchObject(mockUser);
    verify(MockApolloClient.mutate(deepEqual(
      {mutation: UPDATE_USER_MUTATION, variables: {updateUserInput}}
    ))).once();
  });
});

describe('getCurrentUser', () => {
  it('should return the current user', async () => {
    // arrange
    when(MockApolloClient.query<MeQuery>(deepEqual({query: ME_QUERY})))
      .thenResolve({data: {me: mockGQLMe}} as ApolloQueryResult<MeQuery>);
    // act
    const result = await userAPI.getCurrentUser();
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