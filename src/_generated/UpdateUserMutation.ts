/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {UserUpdate} from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateUserMutation
// ====================================================

export interface UpdateUserMutation_updateUser {
  __typename: "User";
  id: string;
  name: string | null;
  username: string;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface UpdateUserMutation {
  updateUser: UpdateUserMutation_updateUser;
}

export interface UpdateUserMutationVariables {
  updateUserInput: UserUpdate;
}
