/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface LoginInput {
  token: string;
}

export interface UserCreation {
  username: string;
  name?: string | null;
  photo?: any | null;
}

export interface UserUpdate {
  username?: string | null;
  name?: string | null;
  deleteName?: boolean | null;
  photo?: any | null;
  deletePhoto?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
