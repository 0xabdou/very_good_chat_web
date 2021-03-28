enum UserError {
  general,
  network,
  notFound,
  usernameTaken,
}

export const stringifyUserError = (error: UserError): string => {
  switch (error) {
    case UserError.network:
      return 'Check your internet';
    case  UserError.notFound:
      return 'User not found';
    case UserError.usernameTaken:
      return 'Username taken';
    default:
      return 'Something weird happened';
  }
};

export default UserError;