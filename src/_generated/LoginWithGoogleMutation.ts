/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoginInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LoginWithGoogleMutation
// ====================================================

export interface LoginWithGoogleMutation_loginWithGoogle_authUser {
  __typename: "AuthUser";
  displayName: string | null;
  photoUrl: string | null;
}

export interface LoginWithGoogleMutation_loginWithGoogle {
  __typename: "LoginResponse";
  accessToken: string;
  authUser: LoginWithGoogleMutation_loginWithGoogle_authUser;
}

export interface LoginWithGoogleMutation {
  loginWithGoogle: LoginWithGoogleMutation_loginWithGoogle;
}

export interface LoginWithGoogleMutationVariables {
  loginWithGoogleInput: LoginInput;
}
