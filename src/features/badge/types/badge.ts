export enum BadgeName {
  NOTIFICATIONS = "NOTIFICATIONS",
  FRIEND_REQUESTS = "FRIEND_REQUESTS"
}

export type Badge = {
  badgeName: BadgeName,
  lastOpened: number
}