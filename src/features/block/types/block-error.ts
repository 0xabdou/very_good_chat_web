enum BlockError {
  general,
  network
}

export default BlockError;

export const stringifyBlockError = (error: BlockError) => {
  switch (error) {
    case BlockError.network:
      return 'Check your internet';
    default:
      return 'Something weird happened';
  }
};