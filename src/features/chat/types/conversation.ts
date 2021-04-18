import User from "../../user/types/user";
import Message from "./message";

type Conversation = {
  id: number,
  type: ConversationType
  participants: User[],
  messages: Message[]
  canChat: boolean,
};

enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  GROUP = 'GROUP'
}

export default Conversation;