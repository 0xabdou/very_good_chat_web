import User from "../../user/types/user";
import Message from "./message";

type Conversation = {
  id: number,
  participants: User[],
  messages: Message[]
  type: ConversationType
};

enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  GROUP = 'GROUP'
}

export default Conversation;