/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserUpdate } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateMe
// ====================================================

export interface UpdateMe_updateUser_user {
  __typename: "User";
  id: string;
  name: string | null;
  username: string;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface UpdateMe_updateUser {
  __typename: "Me";
  user: UpdateMe_updateUser_user;
  activeStatus: boolean;
}

export interface UpdateMe {
  updateUser: UpdateMe_updateUser;
}

export interface UpdateMeVariables {
  updateUserInput: UserUpdate;
}
