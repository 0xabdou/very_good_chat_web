import {Badge, BadgeName} from "../types/badge";
import {Either, left, right} from "fp-ts/Either";
import BadgeError from "../types/badge-error";
import {isApolloError} from "@apollo/client";
import {IBadgeAPI} from "./sources/badge-api";

export interface IBadgeRepository {
  getBadges(): Promise<Either<BadgeError, Badge[]>>;

  updateBadge(badgeName: BadgeName): Promise<Either<BadgeError, Badge>>;
}

export default class BadgeRepository implements IBadgeRepository {
  private readonly _badgeAPI: IBadgeAPI;

  constructor(badgeAPI: IBadgeAPI) {
    this._badgeAPI = badgeAPI;
  }

  getBadges(): Promise<Either<BadgeError, Badge[]>> {
    return BadgeRepository._leftOrRight(() => this._badgeAPI.getBadges());
  }

  updateBadge(badgeName: BadgeName): Promise<Either<BadgeError, Badge>> {
    return BadgeRepository._leftOrRight(() => this._badgeAPI.updateBadge(badgeName));
  }

  static async _leftOrRight<R>(work: () => Promise<R>): Promise<Either<BadgeError, R>> {
    try {
      const result = await work();
      return right(result);
    } catch (e) {
      console.log('BadgeRepo THREW: ', e);
      if (isApolloError(e)) {
        const code = e.graphQLErrors[0]?.extensions?.code;
        if (!code) {
          // Probably an internet error, not sure
          return left(BadgeError.network);
        }
      }
      return left(BadgeError.general);
    }
  }
}