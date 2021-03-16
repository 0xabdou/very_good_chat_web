import User from "../../user/types/user";

export enum FriendshipStatus {
  BLOCKED = "BLOCKED",
  BLOCKING = "BLOCKING",
  FRIENDS = "FRIENDS",
  REQUEST_RECEIVED = "REQUEST_RECEIVED",
  REQUEST_SENT = "REQUEST_SENT",
  STRANGERS = "STRANGERS",
}

export type Friendship = {
  status: FriendshipStatus,
  date: Date,
}

export type FriendshipInfo = {
  user: User,
  friendship: Friendship
}