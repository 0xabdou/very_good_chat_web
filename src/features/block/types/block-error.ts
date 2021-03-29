import FriendError from "../../friend/types/friend-error";

enum BlockError {
  general,
  network
}

export default BlockError;

export const stringifyBlockError = (error: BlockError | null | undefined) => {
  switch (error) {
    case BlockError.network:
      return 'Check your internet';
    default:
      return 'Something weird happened';
  }
};

export const blockToFriendError = (error: BlockError): FriendError => {
  switch (error) {
    case BlockError.network:
      return FriendError.network;
    default:
      return FriendError.general;
  }
};