/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BadgeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateBadge
// ====================================================

export interface UpdateBadge_updateBadge {
  __typename: "Badge";
  badgeName: BadgeName;
  lastOpened: any;
}

export interface UpdateBadge {
  updateBadge: UpdateBadge_updateBadge;
}

export interface UpdateBadgeVariables {
  badgeName: BadgeName;
}
