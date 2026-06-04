import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLastChatId } from '../utils/lastOpenChatId';
import type { Chat, Message } from '../api/chats/types';

interface useChatUIStoreProps {
  currentChatId: number | null;
  currentChatInfo: Chat | null;
  isAtBottom: boolean;
  highlightedMessageId: number | null;
  setHighlightedMessageId: (id: number | null) => void;
  setIsAtBottom: (val: boolean) => void;
  anchorMessageId: number | null;
  setAnchorMessageId: (id: number | null) => void;
  setCurrentChatId: (id: number | null) => void;
  isTyping: { userName: string | null; chatId: number | null; isTyping: boolean };
  setIsTyping: (userName: string, chatId: number, isTyping: boolean) => void;
  menuForMessage: Message | null;
  setMenuForMessage: (message: Message | null) => void;
  pinnedMode: boolean;
  setPinnedMode: (val: boolean) => void;
  setCurrentChatInfo: (val: Chat | null) => void;
  reset: () => void;
}

const useChatUIStore = create<useChatUIStoreProps>()(
  persist(
    (set) => ({
      currentChatId: getLastChatId(),
      currentChatInfo: null,
      highlightedMessageId: null,
      isAtBottom: true,
      anchorMessageId: null,
      isTyping: { userName: null, chatId: null, isTyping: false },
      menuForMessage: null,
      pinnedMode: false,

      setHighlightedMessageId: (val) => set({ highlightedMessageId: val }),
      setIsAtBottom: (val) => set({ isAtBottom: val }),
      setAnchorMessageId: (id) => set({ anchorMessageId: id }),
      setPinnedMode: (val) => set({ pinnedMode: val }),
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setIsTyping: (userName, chatId, isTyping) => {
        set({
          isTyping: {
            userName,
            chatId,
            isTyping,
          },
        });
      },

      setMenuForMessage: (message) => set({ menuForMessage: message }),
      setCurrentChatInfo: (val) => set({ currentChatInfo: val }),
      reset: () =>
        set({
          currentChatId: null,
          currentChatInfo: null,
          anchorMessageId: null,
        }),
    }),
    {
      name: 'chat-ui-storage',
      partialize: (state) => ({
        currentChatId: state.currentChatId,
        currentChatInfo: state.currentChatInfo,
        anchorMessageId: state.anchorMessageId,
      }),
    },
  ),
);

export default useChatUIStore;
