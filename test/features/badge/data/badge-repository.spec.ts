import {anything, instance, mock, verify, when} from "ts-mockito";
import {IBadgeAPI} from "../../../../src/features/badge/data/sources/badge-api";
import BadgeRepository
  from "../../../../src/features/badge/data/badge-repository";
import {ApolloError} from "@apollo/client";
import {left, right} from "fp-ts/Either";
import BadgeError from "../../../../src/features/badge/types/badge-error";
import {mockGQLBadge} from "../../../mock-objects";
import {BadgeName} from "../../../../src/features/badge/types/badge";

const MockBadgeAPI = mock<IBadgeAPI>();
const badgeRepo = new BadgeRepository(instance(MockBadgeAPI));

describe('error catching', () => {
  const act = (error: Error) => BadgeRepository._leftOrRight(() => {
    throw error;
  });

  it('should catch network errors', async () => {
    // arrange
    const error = new ApolloError({errorMessage: 'LOL'});
    // act
    const result = await act(error);
    // assert
    expect(result).toStrictEqual(left(BadgeError.network));
  });

  it('should catch general errors', async () => {
    // arrange
    const error = new Error('Huh');
    // act
    const result = await act(error);
    // assert
    expect(result).toStrictEqual(left(BadgeError.general));
  });
});

describe('getBadges', () => {
  it('should return badges', async () => {
    // arrange
    when(MockBadgeAPI.getBadges()).thenResolve([mockGQLBadge]);
    // act
    const result = await badgeRepo.getBadges();
    // assert
    expect(result).toStrictEqual(right([mockGQLBadge]));
    verify(MockBadgeAPI.getBadges()).once();
  });
});

describe('getBadges', () => {
  it('should return badges', async () => {
    // arrange
    const badgeName = BadgeName.NOTIFICATIONS;
    when(MockBadgeAPI.updateBadge(anything())).thenResolve(mockGQLBadge);
    // act
    const result = await badgeRepo.updateBadge(badgeName);
    // assert
    expect(result).toStrictEqual(right(mockGQLBadge));
    verify(MockBadgeAPI.updateBadge(badgeName)).once();
  });
});