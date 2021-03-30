/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserCreation } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateMe
// ====================================================

export interface CreateMe_register_user {
  __typename: "User";
  id: string;
  name: string | null;
  username: string;
  photoURLSource: string | null;
  photoURLMedium: string | null;
  photoURLSmall: string | null;
}

export interface CreateMe_register {
  __typename: "Me";
  user: CreateMe_register_user;
  activeStatus: boolean;
}

export interface CreateMe {
  register: CreateMe_register;
}

export interface CreateMeVariables {
  registerInput: UserCreation;
}
