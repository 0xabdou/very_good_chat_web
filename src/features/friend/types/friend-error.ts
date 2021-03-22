enum FriendError {
  general,
  network,
  requestAlreadyReceived,
  requestRemoved,
  alreadyFriends
}

export const stringifyFriendError = (e: FriendError | null) => {
  switch (e) {
    case FriendError.alreadyFriends:
      return "You're already friends";
    case FriendError.requestRemoved:
      return "This request was deleted";
    case FriendError.requestAlreadyReceived:
      return "This user already sent you a request";
    case FriendError.network:
      return "Check your internet";
    default:
      return "Something weird happened";
  }
};

export default FriendError;
