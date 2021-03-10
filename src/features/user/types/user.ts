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

export default User;