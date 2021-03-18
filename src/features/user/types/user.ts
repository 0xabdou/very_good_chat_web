export type User = {
  id: string,
  username: string,
  name: string | null,
  photo: Photo | null,
}

export type Photo = {
  source: string,
  medium: string,
  small: string
}

export type UserCreation = {
  username: string,
  name?: string,
  photo?: File,
};

export type UserUpdate= {
  username?: string,
  name?: string,
  deleteName?: boolean,
  photo?: File,
  deletePhoto?: boolean,
};

export type GetUserArgs = {
  userID?: string,
  username?: string,
}

export default User;