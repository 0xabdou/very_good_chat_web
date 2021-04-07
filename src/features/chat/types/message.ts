import {Media} from "./media";

type Message = {
  id: number,
  conversationID: number,
  senderID: string,
  text?: string,
  medias?: Media[],
  sentAt: number,
  deliveredTo: Delivery[],
  seenBy: Delivery[],
  sent: boolean,
  error?: boolean,
}

export type Delivery = {
  userID: string,
  date: number
}

export default Message;