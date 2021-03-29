import User from "../../user/types/user";

type Friend = {
  user: User,
  friendshipDate: number,
  lastSeen?: number
}

export default Friend;