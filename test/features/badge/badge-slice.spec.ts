import StoreExtraArg from "../../../src/core/redux/store-extra-arg";
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {IBadgeRepository} from "../../../src/features/badge/data/badge-repository";
import {getMockStore, mockBadge, mockTheDate} from "../../mock-objects";
import reducer, {
  badgeActions,
  initialBadgeState
} from "../../../src/features/badge/badge-slice";
import {left, right} from "fp-ts/Either";
import BadgeError from "../../../src/features/badge/types/badge-error";
import {PayloadAction} from "@reduxjs/toolkit";
import {Badge, BadgeName} from "../../../src/features/badge/types/badge";

const MockBadgeRepo = mock<IBadgeRepository>();
const mockStore = getMockStore()();

const extra = {
  badgeRepo: instance(MockBadgeRepo)
} as StoreExtraArg;

const {getBadges, updateBadge} = badgeActions;

let spy: jest.SpyInstance;
let mockDate: Date;
beforeAll(() => {
  [spy, mockDate] = mockTheDate();
});

afterAll(() => {
  spy.mockRestore();
});

beforeEach(() => {
  reset(MockBadgeRepo);
});

describe('getBadges', () => {
  const act = () => getBadges()(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockBadgeRepo.getBadges()).thenResolve(right([mockBadge]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getBadges.fulfilled.type);
    expect(result.payload).toStrictEqual([mockBadge]);
    verify(MockBadgeRepo.getBadges()).once();
  });

  it('should return the right action if rejected', async () => {
    // arrange
    when(MockBadgeRepo.getBadges()).thenResolve(left(BadgeError.network));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getBadges.rejected.type);
    expect(result.payload).toStrictEqual(BadgeError.network);
    verify(MockBadgeRepo.getBadges()).once();
  });

  describe('reducers', () => {
    it('should return the right state if fulfilled', () => {
      // arrange
      const notifBadge: Badge = {
        badgeName: BadgeName.NOTIFICATIONS,
        lastOpened: 2234,
      };
      const reqBadge: Badge = {
        badgeName: BadgeName.FRIEND_REQUESTS,
        lastOpened: 1111
      };
      const action: PayloadAction<Badge[]> = {
        type: getBadges.fulfilled.type,
        payload: [reqBadge, notifBadge]
      };
      const state = {...initialBadgeState};
      // act
      const result = reducer(state, action);
      // assert
      expect(result.notifications).toBe(notifBadge.lastOpened);
      expect(result.friendRequests).toBe(reqBadge.lastOpened);
    });
  });
});

describe('updateBadge', () => {
  const act = (badgeName: BadgeName) => updateBadge(badgeName)(
    mockStore.dispatch,
    mockStore.getState,
    extra
  );

  const badgeName = BadgeName.NOTIFICATIONS;

  it('should return the right action when fulfilled', async () => {
    // arrange
    when(MockBadgeRepo.updateBadge(anything())).thenResolve(right(mockBadge));
    // act
    const result = await act(badgeName);
    // assert
    expect(result.type).toBe(updateBadge.fulfilled.type);
    expect(result.payload).toStrictEqual(mockBadge);
    verify(MockBadgeRepo.updateBadge(badgeName)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    when(MockBadgeRepo.updateBadge(anything())).thenResolve(left(BadgeError.network));
    // act
    const result = await act(badgeName);
    // assert
    expect(result.type).toBe(updateBadge.rejected.type);
    expect(result.payload).toStrictEqual(BadgeError.network);
    verify(MockBadgeRepo.updateBadge(badgeName)).once();
  });

  describe('reducers', () => {
    describe('pending', () => {
      const testPending = (badgeName: BadgeName) => {
        it(`should return the right state when pending (${badgeName})`, () => {
          // arrange
          const state = {...initialBadgeState};
          const action: PayloadAction<void, string, { arg: BadgeName }> = {
            type: updateBadge.pending.type,
            payload: undefined,
            meta: {arg: badgeName}
          };
          // act
          const result = reducer(state, action);
          // assert
          switch (badgeName) {
            case BadgeName.FRIEND_REQUESTS:
              expect(result.friendRequests).toBe(mockDate.getTime());
              break;
            case BadgeName.NOTIFICATIONS:
              expect(result.notifications).toBe(mockDate.getTime());
              break;
          }
        });
      };
      Object.values(BadgeName).forEach(testPending);
    });
  });
});