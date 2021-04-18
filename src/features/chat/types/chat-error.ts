enum ChatError {
  general,
  network,
  blocked,
  blocking
}

export const stringifyChatError = (error: ChatError) => {
  switch (error) {
    case ChatError.network:
      return 'Check your internet';
    case ChatError.blocked:
      return "You are blocked by this user";
    case ChatError.blocking:
      return "You are blocking this user";
    default:
      return 'Something weird happened';
  }
};

export default ChatError;