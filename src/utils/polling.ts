const _pollingInterval = 1000;
let _polling: NodeJS.Timeout;

export const startPolling = (work: () => void) => {
  if (_polling) clearInterval(_polling);
  work();
  _polling = setInterval(work, _pollingInterval);
};

export const stopPolling = () => {
  if (_polling) clearInterval(_polling);
};