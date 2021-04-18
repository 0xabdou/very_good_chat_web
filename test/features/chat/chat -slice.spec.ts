import {
  anything,
  deepEqual,
  instance,
  mock,
  reset,
  verify,
  when
} from "ts-mockito";
import {IChatRepository} from "../../../src/features/chat/data/chat-repository";
import {IFileUtils} from "../../../src/shared/utils/file-utils";
import StoreExtraArg from "../../../src/core/redux/store-extra-arg";
import {
  getMockStore,
  initialMeState,
  mockConversation,
  mockMe,
  mockMedia,
  mockMessage,
  mockTheDate,
  mockTyping,
  mockTypingInput
} from "../../mock-objects";
import {AppState, AppStore} from "../../../src/core/redux/store";
import reducer, {
  _handleRejected,
  chatActions,
  ChatState,
  initialChatState
} from "../../../src/features/chat/chat-slice";
import {left, right} from "fp-ts/Either";
import ChatError from "../../../src/features/chat/types/chat-error";
import {PayloadAction} from "@reduxjs/toolkit";
import Conversation from "../../../src/features/chat/types/conversation";
import {
  MESSAGES_PER_FETCH,
  SendMessageInput
} from "../../../src/features/chat/data/sources/chat-api";
import Message, {MessageSub} from "../../../src/features/chat/types/message";
import Observable from "zen-observable";
import {waitFor} from "@testing-library/react";
import Typing from "../../../src/features/chat/types/typing";

const MockChatRepo = mock<IChatRepository>();
const MockFileUtils = mock<IFileUtils>();
const MockStore = getMockStore();
let mockStore = MockStore({
  chat: initialChatState,
  me: {...initialMeState, me: mockMe}
} as AppState);
const extra = {
  chatRepo: instance(MockChatRepo),
  fileUtils: instance(MockFileUtils),
} as StoreExtraArg;
const chatError = ChatError.network;
const [spy, mockDate] = mockTheDate();

beforeEach(() => {
  reset(MockChatRepo);
  reset(MockFileUtils);
  mockStore = MockStore({
    chat: initialChatState,
    me: {...initialMeState, me: mockMe}
  } as AppState);
});

afterAll(() => {
  spy.mockRestore();
});

describe('general purpose reducers', () => {
  describe('_handleRejected', () => {
    it('should return the right state if the error is undefined', () => {
      // arrange
      const inputState: ChatState = {...initialChatState};
      const outputState: ChatState = {...inputState, error: ChatError.general};
      const action: PayloadAction<undefined> = {
        type: 'any',
        payload: undefined
      };
      // act
      _handleRejected(inputState, action);
      // assert
      expect(inputState).toStrictEqual(outputState);
    });
    it('should return the right state if the error is defined', () => {
      // arrange
      const inputState: ChatState = {...initialChatState};
      const outputState: ChatState = {...inputState, error: chatError};
      const action: PayloadAction<ChatError> = {
        type: 'any',
        payload: chatError
      };
      // act
      _handleRejected(inputState, action);
      // assert
      expect(inputState).toStrictEqual(outputState);
    });
  });
});

describe('getConversations', () => {
  const {getConversations} = chatActions;
  const act = (store: AppStore = mockStore) => getConversations()(
    store.dispatch,
    store.getState,
    extra
  );

  it('should return the right state when fulfilled', async () => {
    // arrange
    when(MockChatRepo.getConversations()).thenResolve(right([mockConversation]));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getConversations.fulfilled.type);
    expect(result.payload).toStrictEqual([mockConversation]);
    verify(MockChatRepo.getConversations()).once();
    verify(MockChatRepo.messagesDelivered(deepEqual([mockConversation.id]))).once();
  });

  it('should return the right state when rejected', async () => {
    // arrange
    when(MockChatRepo.getConversations()).thenResolve(left(chatError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getConversations.rejected.type);
    expect(result.payload).toBe(chatError);
    verify(MockChatRepo.getConversations()).once();
  });

  describe('reducers', () => {
    it('should return the right state if pending', () => {
      // arrange
      const inputState: ChatState = {...initialChatState, error: chatError};
      const outputState: ChatState = {...inputState, error: null};
      const action: PayloadAction<undefined> = {
        type: getConversations.pending.type, payload: undefined
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const inputState: ChatState = {...initialChatState};
      const outputState: ChatState = {
        ...inputState,
        conversations: [mockConversation]
      };
      const action: PayloadAction<Conversation[]> = {
        type: getConversations.fulfilled.type,
        payload: [mockConversation]
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});

describe('getOrCreateOTOConversation', () => {
  const {getOrCreateOTOConversation} = chatActions;
  const userID = 'userIIIIID';
  const act = (store: AppStore = mockStore) => getOrCreateOTOConversation(userID)(
    store.dispatch,
    store.getState,
    extra
  );

  it('should return the right state if fulfilled', async () => {
    // arrange
    when(MockChatRepo.getOrCreateOTOConversation(anything()))
      .thenResolve(right(mockConversation));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getOrCreateOTOConversation.fulfilled.type);
    expect(result.payload).toStrictEqual(mockConversation);
    verify(MockChatRepo.getOrCreateOTOConversation(userID)).once();
    verify(MockChatRepo.messagesDelivered(deepEqual([mockConversation.id]))).once();
  });

  it('should return the right state if rejected', async () => {
    // arrange
    when(MockChatRepo.getOrCreateOTOConversation(anything()))
      .thenResolve(left(chatError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(getOrCreateOTOConversation.rejected.type);
    expect(result.payload).toStrictEqual(chatError);
    verify(MockChatRepo.getOrCreateOTOConversation(userID)).once();
  });

  describe('reducers', () => {
    describe('should return the right state if fulfilled', () => {
      it('when conversations is null', () => {
        // arrange
        const inputState: ChatState = {...initialChatState};
        const outputState: ChatState = {
          ...inputState,
          conversations: [mockConversation]
        };
        const action: PayloadAction<Conversation> = {
          type: getOrCreateOTOConversation.fulfilled.type,
          payload: mockConversation
        };
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
      it('when conversations is not null, but does not contain the received conversation', () => {
        // arrange
        const inputState: ChatState = {
          ...initialChatState,
          conversations: [{...mockConversation, id: 1234567890}]
        };
        const outputState: ChatState = {
          ...inputState,
          conversations: [...inputState.conversations!, mockConversation]
        };
        const action: PayloadAction<Conversation> = {
          type: getOrCreateOTOConversation.fulfilled.type,
          payload: mockConversation
        };
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
      it('when conversations is not null, and contains the received conversation', () => {
        // arrange
        const inputState: ChatState = {
          ...initialChatState,
          conversations: [
            {...mockConversation, id: 1234567890},
            {...mockConversation, messages: []},
            {...mockConversation, id: 123456789011}
          ]
        };
        const outputState: ChatState = {
          ...inputState,
          conversations: [
            {...mockConversation, id: 1234567890},
            mockConversation,
            {...mockConversation, id: 123456789011}
          ]
        };
        const action: PayloadAction<Conversation> = {
          type: getOrCreateOTOConversation.fulfilled.type,
          payload: mockConversation
        };
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
    });
  });
});

describe('getMoteMessages', () => {
  const convID = 1223;
  const msgID = 77777;
  const conv: Conversation = {
    ...mockConversation,
    id: convID,
    messages: [
      {...mockMessage, id: msgID},
      {...mockMessage, id: 88888},
    ]
  };

  const testInputState: ChatState = {
    ...initialChatState,
    conversations: [conv]
  };

  const act = (store: AppStore = mockStore) => chatActions.getMoreMessages(convID)(
    store.dispatch,
    store.getState,
    extra
  );

  it('should return the right action when fulfilled', async () => {
    // arrange
    const store = MockStore({chat: testInputState} as AppState);
    when(MockChatRepo.getMoreMessages(anything(), anything())).thenResolve(right([mockMessage]));
    // act
    const result = await act(store);
    // assert
    expect(result.type).toBe(chatActions.getMoreMessages.fulfilled.type);
    expect(result.payload).toStrictEqual([mockMessage]);
    verify(MockChatRepo.getMoreMessages(convID, msgID)).once();
  });

  it('should return the right action when rejected', async () => {
    // arrange
    const store = MockStore({chat: testInputState} as AppState);
    when(MockChatRepo.getMoreMessages(anything(), anything())).thenResolve(left(chatError));
    // act
    const result = await act(store);
    // assert
    expect(result.type).toBe(chatActions.getMoreMessages.rejected.type);
    expect(result.payload).toBe(chatError);
    verify(MockChatRepo.getMoreMessages(convID, msgID)).once();
  });

  describe('reducers', () => {
    const loadingState: ChatState = {
      ...testInputState,
      conversations: [{...conv, fetchingMore: true}]
    };

    it('should return the right state when pending', () => {
      // arrange
      const inputState: ChatState = {...testInputState};
      const outputState: ChatState = {...loadingState};
      const action: PayloadAction<void, string, { arg: number }> = {
        type: chatActions.getMoreMessages.pending.type,
        payload: undefined,
        meta: {arg: convID}
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state when rejected', () => {
      // arrange
      const inputState: ChatState = {...loadingState};
      const outputState: ChatState = {
        ...testInputState,
        conversations: [{...conv, fetchingMore: false}]
      };
      const action: PayloadAction<ChatError, string, { arg: number }> = {
        type: chatActions.getMoreMessages.rejected.type,
        payload: chatError,
        meta: {arg: convID}
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    describe('fulfilled', () => {
      it(
        `should return the right state if the number of messages >= ${MESSAGES_PER_FETCH}`,
        async () => {
          // arrange
          const messages = Array.from(
            {length: MESSAGES_PER_FETCH},
            (_, idx): Message => ({...mockMessage, id: idx})
          );
          const inputState: ChatState = {...loadingState};
          const outputState: ChatState = {
            ...inputState,
            conversations: [
              {
                ...conv,
                messages: [...messages, ...conv.messages],
                hasMore: true,
                fetchingMore: false,
              }
            ],
          };
          const action: PayloadAction<Message[], string, { arg: number }> = {
            type: chatActions.getMoreMessages.fulfilled.type,
            payload: messages,
            meta: {arg: convID}
          };
          // act
          const result = reducer(inputState, action);
          // assert
          expect(result).toStrictEqual(outputState);
        }
      );

      it(
        `should return the right state if the number of messages < ${MESSAGES_PER_FETCH}`,
        async () => {
          // arrange
          const messages = Array.from(
            {length: 29},
            (_, idx): Message => ({...mockMessage, id: idx})
          );
          const inputState: ChatState = {...loadingState};
          const outputState: ChatState = {
            ...inputState,
            conversations: [
              {
                ...conv,
                messages: [...messages, ...conv.messages],
                hasMore: false,
                fetchingMore: false,
              }
            ],
          };
          const action: PayloadAction<Message[], string, { arg: number }> = {
            type: chatActions.getMoreMessages.fulfilled.type,
            payload: messages,
            meta: {arg: convID}
          };
          // act
          const result = reducer(inputState, action);
          // assert
          expect(result).toStrictEqual(outputState);
        }
      );
    });
  });
});

describe("typing", () => {
  it("should do what it's fated to do", async () => {
    // act
    await chatActions.typing(mockTypingInput)(
      mockStore.dispatch,
      mockStore.getState,
      extra
    );
    // assert
    verify(MockChatRepo.typing(mockTypingInput)).once();
  });
});

describe('sendMessage', () => {
  const {sendMessage, appendMessage} = chatActions;
  const conversationID = 911;
  const tempID = 199;
  const input: SendMessageInput & { tempID: number } = {
    conversationID,
    tempID,
    text: 'Hello world',
    medias: [new File(['1'], 'media.png')],
  };
  const pendingMessage: Message = {
    id: input.tempID,
    conversationID: input.conversationID,
    senderID: mockMe.id,
    text: input.text,
    medias: [mockMedia],
    sentAt: mockDate.getTime(),
    deliveredTo: [],
    seenBy: [],
    sent: false
  };

  const act = (store: AppStore = mockStore) => sendMessage(input)(
    store.dispatch,
    store.getState,
    extra
  );

  beforeEach(() => {
    when(MockFileUtils.getMedia(anything())).thenResolve(mockMedia);
  });

  it('should dispatch appendMessage with the right message', async () => {
    // arrange
    when(MockChatRepo.sendMessage(anything())).thenResolve(right(mockMessage));
    // act
    await act();
    // assert
    expect(mockStore.getActions()).toHaveLength(3);
    const action = mockStore.getActions()[1] as PayloadAction<Message>;
    expect(action.type).toBe(appendMessage.type);
    expect(action.payload).toStrictEqual({message: pendingMessage});
  });

  it('should return the right action if fulfilled', async () => {
    // arrange
    when(MockChatRepo.sendMessage(anything())).thenResolve(right(mockMessage));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(sendMessage.fulfilled.type);
    expect(result.payload).toStrictEqual(mockMessage);
  });

  it('should return the right action if rejected', async () => {
    // arrange
    when(MockChatRepo.sendMessage(anything())).thenResolve(left(chatError));
    // act
    const result = await act();
    // assert
    expect(result.type).toBe(sendMessage.rejected.type);
    expect(result.payload).toBe(chatError);
  });

  describe('reducers', () => {
    const convs: Conversation[] = [
      {
        ...mockConversation,
        id: 0,
        messages: [{...mockMessage, id: 90, conversationID: 0}]
      },
      {
        ...mockConversation,
        id: 1,
        messages: [
          {...mockMessage, id: 91, conversationID: 1},
          {...pendingMessage, conversationID: 1},
          {...mockMessage, id: 93, conversationID: 1}
        ]
      },
      {
        ...mockConversation,
        id: 2,
        messages: [{...mockMessage, id: 92, conversationID: 2}]
      },
    ];

    const conversationID = convs[1].id;
    const sentMessage: Message = {
      ...mockMessage, id: 2435678908896978, conversationID,
    };
    const sentInput: SendMessageInput & { tempID: number } = {
      ...input, conversationID,
    };
    const inputState: ChatState = {...initialChatState, conversations: convs};

    test('appendMessage (not mine)', () => {
      // arrange
      const pendingMessage = inputState.conversations![1].messages[1];
      const inputState1: ChatState = {
        ...inputState,
        conversations: [
          convs[0],
          {
            ...convs[1],
            messages: [
              convs[1].messages[0],
              convs[1].messages[2],
            ]
          },
          convs[2]
        ]
      };
      const outputState: ChatState = {
        ...inputState1,
        conversations: [
          {
            ...convs[1],
            messages: [
              convs[1].messages[0],
              convs[1].messages[2],
              pendingMessage,
            ],
            seenDates: {
              ...convs[1].seenDates,
              [pendingMessage.senderID]: pendingMessage.sentAt
            }
          },
          convs[0],
          convs[2]
        ]
      };
      const action = appendMessage({message: pendingMessage});
      // act
      const result = reducer(inputState1, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    test('appendMessage (mine)', () => {
      // arrange
      const pendingMessage = inputState.conversations![1].messages[1];
      const inputState1: ChatState = {
        ...inputState,
        conversations: [
          convs[0],
          {
            ...convs[1],
            messages: [
              convs[1].messages[0],
              convs[1].messages[2],
            ]
          },
          convs[2]
        ]
      };
      const outputState: ChatState = {
        ...inputState1,
        conversations: [
          {
            ...convs[1],
            messages: [
              convs[1].messages[0],
              convs[1].messages[2],
              pendingMessage,
            ],
          },
          convs[0],
          convs[2]
        ]
      };
      const action = appendMessage({message: pendingMessage, mine: true});
      // act
      const result = reducer(inputState1, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if fulfilled', () => {
      // arrange
      const outputState: ChatState = {
        ...inputState,
        conversations: [
          convs[0],
          {
            ...convs[1],
            id: sentMessage.conversationID,
            messages: [
              convs[1].messages[0],
              sentMessage,
              convs[1].messages[2],
            ]
          },
          convs[2],
        ]
      };
      const action: PayloadAction<Message, string, { arg: SendMessageInput & { tempID: number } }> = {
        type: sendMessage.fulfilled.type,
        payload: sentMessage,
        meta: {arg: sentInput}
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if rejected', () => {
      // arrange
      const outputState: ChatState = {
        ...inputState,
        conversations: [
          convs[0],
          {
            ...convs[1],
            id: sentMessage.conversationID,
            messages: [
              convs[1].messages[0],
              {...convs[1].messages[1], error: true},
              convs[1].messages[2],
            ]
          },
          convs[2],
        ]
      };
      const action: PayloadAction<ChatError, string, { arg: SendMessageInput & { tempID: number } }> = {
        type: sendMessage.rejected.type,
        payload: chatError,
        meta: {arg: sentInput}
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    it('should return the right state if rejected with a block', () => {
      // arrange
      const outputState: ChatState = {
        ...inputState,
        conversations: [
          convs[0],
          {
            ...convs[1],
            id: sentMessage.conversationID,
            messages: [
              convs[1].messages[0],
              {...convs[1].messages[1], error: true},
              convs[1].messages[2],
            ],
            canChat: false,
          },
          convs[2],
        ]
      };
      const action: PayloadAction<ChatError, string, { arg: SendMessageInput & { tempID: number } }> = {
        type: sendMessage.rejected.type,
        payload: ChatError.blocked,
        meta: {arg: sentInput}
      };
      // act
      const result = reducer(inputState, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});

describe('subscribeToMessages', () => {
  const act = (store: AppStore) => chatActions.subscribeToMessages()(
    store.dispatch,
    store.getState,
    extra
  );

  it('should dispatch the right action every time there is a message', async () => {
    // arrange
    const conv: Conversation = {
      ...mockConversation,
      id: 1234,
      messages: [
        {...mockMessage, id: 12345}
      ]
    };
    const state: ChatState = {
      ...initialChatState,
      conversations: [conv]
    };
    const store = MockStore({
      chat: state,
      me: {...initialMeState, me: mockMe}
    } as AppState);
    const m1: MessageSub = {
      message: {
        ...mockMessage,
        conversationID: conv.id,
        id: conv.messages[0].id,
        text: 'SSSSSSSSSSSSSSSSSSSSSSSSSS'
      },
      update: true,
    };
    const m2: MessageSub = {
      message: {
        ...mockMessage,
        conversationID: conv.id,
        senderID: mockMe.id,
        id: conv.messages[0].id,
        text: 'SSSSSSSSSSSSSSSSSSSSSSSSSS'
      },
      update: true,
    };
    const m3: MessageSub = {
      message: {
        ...mockMessage,
        conversationID: conv.id,
        id: 592827487,
        text: 'ZBLBOLA'
      },
    };
    const observable = Observable.of<MessageSub>(m1, m2, m3);
    when(MockChatRepo.subscribeToMessages()).thenReturn(observable);
    // act
    act(store);
    // wait...
    await waitFor(() => {
      expect(
        store.getActions().findIndex((action: PayloadAction) => {
          return action.type == chatActions.appendMessage.type;
        })).not.toBe(-1);
    });
    // assert
    const acts = store.getActions();
    const idx = acts.findIndex(action => action.type == chatActions.updateMessage.type);
    expect(acts[idx].type).toBe(chatActions.updateMessage.type);
    expect(acts[idx].payload).toStrictEqual({message: m1.message, mine: false});
    expect(acts[idx + 1].type).toBe(chatActions.updateMessage.type);
    expect(acts[idx + 1].payload).toStrictEqual({
      message: m2.message,
      mine: true
    });
    expect(acts[idx + 2].type).toBe(chatActions.appendMessage.type);
    expect(acts[idx + 2].payload).toStrictEqual({
      message: m3.message,
      mine: false
    });
    verify(MockChatRepo.subscribeToMessages()).once();
  });
});

describe('reducers', () => {
  const id1 = 1;
  const msg1: Message = {
    ...mockMessage,
    senderID: 'senderID1',
    conversationID: id1,
    id: 11,
  };
  const conv1: Conversation = {
    ...mockConversation,
    id: id1,
    messages: [msg1]
  };
  const id2 = 2;
  const msg2: Message = {
    ...mockMessage,
    senderID: 'senderID2',
    conversationID: id2,
    id: 21,
  };
  const conv2: Conversation = {
    ...mockConversation,
    id: 2,
    messages: [msg2],
    seenDates: {[msg1.senderID]: 0},
  };
  const state: ChatState = {
    ...initialChatState,
    conversations: [conv1, conv2]
  };

  describe('updateMessage', () => {
    test('mine', () => {
      // arrange
      const date = new Date().getTime() + 10000;
      const msg: Message = {
        ...mockMessage,
        conversationID: id2,
        text: "WAAAAAAAAAAA MIIIIIIII",
        seenBy: [
          {userID: msg1.senderID, date}
        ],
        id: 21,
      };
      const action = chatActions.updateMessage({message: msg, mine: true});
      const outputState: ChatState = {
        ...state,
        conversations: [
          conv1,
          {
            ...conv2,
            seenDates: {
              ...conv2.seenDates,
              [msg.seenBy[0].userID]: msg.seenBy[0].date
            },
            messages: [msg]
          },
        ]
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });

    test('not mine', () => {
      // arrange
      const msg: Message = {
        ...mockMessage,
        conversationID: id2,
        text: "WAAAAAAAAAAA MIIIIIIII",
        id: 21,
      };
      const action = chatActions.updateMessage({message: msg});
      const outputState: ChatState = {
        ...state,
        conversations: [
          conv1,
          {...conv2, messages: [msg]},
        ]
      };
      // act
      const result = reducer(state, action);
      // assert
      expect(result).toStrictEqual(outputState);
    });
  });
});

describe("subscribeToTypings", () => {
  it('should subscribe to typings', async () => {
    // arrange
    const observable = Observable.of<Typing>(mockTyping, {
      ...mockTyping,
      started: false
    });
    when(MockChatRepo.subscribeToTypings()).thenReturn(observable);
    // act
    await chatActions.subscribeToTypings()(
      mockStore.dispatch,
      mockStore.getState,
      extra
    );
    // assert
    await waitFor(() => {
      const action = mockStore.getActions().find(a => a.type == chatActions.removeTyping.type);
      expect(action).not.toBeUndefined();
      expect(action!.payload).toStrictEqual({...mockTyping, started: false});
    });
    const action = mockStore.getActions().find(a => a.type == chatActions.addTyping.type);
    expect(action).not.toBeUndefined();
    expect(action!.payload).toStrictEqual(mockTyping);
    verify(MockChatRepo.subscribeToTypings()).once();
  });

  describe('reducers', () => {
    describe("addTyping", () => {
      test("existing typing with userID", () => {
        // arrange
        const inputState: ChatState = {
          ...initialChatState,
          typings: {
            [mockTyping.conversationID]: [mockTyping.userID]
          }
        };
        const outputState = inputState;
        const action = chatActions.addTyping(mockTyping);
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
      test("existing typing without userID", () => {
        // arrange
        const inputState: ChatState = {
          ...initialChatState,
          typings: {
            [mockTyping.conversationID]: ["zblbola"]
          }
        };
        const outputState: ChatState = {
          ...initialChatState,
          typings: {
            [mockTyping.conversationID]: ["zblbola", mockTyping.userID]
          }
        };
        const action = chatActions.addTyping(mockTyping);
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
      test("non-existing typing", () => {
        // arrange
        const inputState: ChatState = {...initialChatState};
        const outputState: ChatState = {
          ...inputState,
          typings: {
            ...inputState.typings,
            [mockTyping.conversationID]: [mockTyping.userID]
          }
        };
        const action = chatActions.addTyping(mockTyping);
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
    });

    describe("removeTyping", () => {
      test("existing typing", () => {
        // arrange
        const inputState: ChatState = {
          ...initialChatState,
          typings: {
            [mockTyping.conversationID]: ["zblbola", mockTyping.userID]
          }
        };
        const outputState: ChatState = {
          ...initialChatState,
          typings: {
            [mockTyping.conversationID]: ["zblbola"]
          }
        };
        const action = chatActions.removeTyping(mockTyping);
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
      test("non-existing typing", () => {
        // arrange
        const inputState: ChatState = {...initialChatState};
        const outputState: ChatState = {...inputState};
        const action = chatActions.removeTyping(mockTyping);
        // act
        const result = reducer(inputState, action);
        // assert
        expect(result).toStrictEqual(outputState);
      });
    });
  });
});