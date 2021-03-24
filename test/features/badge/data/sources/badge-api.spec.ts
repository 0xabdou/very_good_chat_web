import {
  anything,
  deepEqual,
  instance,
  mock,
  resetCalls,
  verify,
  when
} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import BadgeAPI from "../../../../../src/features/badge/data/sources/badge-api";
import {GetBadges} from "../../../../../src/_generated/GetBadges";
import {mockGQLBadge} from "../../../../mock-objects";
import {
  GET_BADGES_QUERY,
  UPDATE_BADGE_MUTATION
} from "../../../../../src/features/badge/data/graphql";
import {UpdateBadge} from "../../../../../src/_generated/UpdateBadge";
import {BadgeName} from "../../../../../src/features/badge/types/badge";

const MockApolloClient = mock<ApolloClient<any>>();

const badgeAPI = new BadgeAPI(instance(MockApolloClient));

beforeEach(() => {
  resetCalls(MockApolloClient);
});

describe('getBadges', () => {
  it('should return badges', async () => {
    // arrange
    when(MockApolloClient.query(anything())).thenResolve({
      data: {getBadges: [mockGQLBadge]}
    } as ApolloQueryResult<GetBadges>);
    // act
    const result = await badgeAPI.getBadges();
    // assert
    expect(result).toStrictEqual([mockGQLBadge]);
    verify(MockApolloClient.query(deepEqual({
      query: GET_BADGES_QUERY,
      fetchPolicy: 'no-cache'
    }))).once();
  });
});

describe('updateBadge', () => {
  it('should return a badge', async () => {
    // arrange
    const badgeName = BadgeName.FRIEND_REQUESTS;
    when(MockApolloClient.mutate(anything())).thenResolve({
      data: {updateBadge: mockGQLBadge}
    } as ApolloQueryResult<UpdateBadge>);
    // act
    const result = await badgeAPI.updateBadge(badgeName);
    // assert
    expect(result).toStrictEqual(mockGQLBadge);
    verify(MockApolloClient.mutate(deepEqual({
      mutation: UPDATE_BADGE_MUTATION,
      variables: {badgeName}
    }))).once();
  });
});
