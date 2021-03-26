enum NotificationError {
  general,
  network
}

export const stringifyNotificationError = (error: NotificationError): string => {
  switch (error) {
    case NotificationError.network:
      return 'Check your internet';
    default:
      return 'Something weird happened';
  }
};

export default NotificationError;
