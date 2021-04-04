enum ChatError {
  general,
  network
}

export const stringifyChatError = (error: ChatError) => {
  switch (error) {
    case ChatError.network:
      return 'Check your internet';
    default:
      return 'Something weird happened';
  }
};

export default ChatError;