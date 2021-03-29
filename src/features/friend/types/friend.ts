import User from "../../user/types/user";

type Friend = {
  user: User,
  date: number,
  lastSeen?: number
}

export default Friend;