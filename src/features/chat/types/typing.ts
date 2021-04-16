type Typing = {
  conversationID: number,
  userID: string,
  started: boolean,
};


export type TypingInput = {
  conversationID: number,
  started: boolean,
}

export default Typing;