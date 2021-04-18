import User from "../../user/types/user";
import Message from "./message";

type Conversation = {
  id: number,
  participants: User[],
  messages: Message[]
  type: ConversationType
  seenDates: UsersLastSeen,
  hasMore: boolean,
  canChat: boolean,
  fetchingMore?: boolean,
};

enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  GROUP = 'GROUP'
}

export type UsersLastSeen = {
  [userID: string]: number
}

export default Conversation;