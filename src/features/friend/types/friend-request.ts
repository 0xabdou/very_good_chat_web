import User from "../../user/types/user";

export type FriendRequest = {
  user: User,
  date: number,
}

export type FriendRequests = {
  sent: FriendRequest[],
  received: FriendRequest[],
}