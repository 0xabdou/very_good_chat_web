import User from "../../user/types/user";

export type FriendRequest = {
  user: User,
  date: Date,
}

export type FriendRequests = {
  sent: FriendRequest[],
  received: FriendRequest[],
}