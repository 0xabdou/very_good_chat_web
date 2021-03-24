/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BadgeName } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetBadges
// ====================================================

export interface GetBadges_getBadges {
  __typename: "Badge";
  badgeName: BadgeName;
  lastOpened: any;
}

export interface GetBadges {
  getBadges: GetBadges_getBadges[];
}
