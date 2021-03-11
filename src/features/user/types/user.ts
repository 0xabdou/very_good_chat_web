type User = {
  id: string,
  username: string,
  name: string | null,
  photoURL: string | null,
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

export default User;