import { create } from 'zustand';
import type { Message } from '../api/types';
import { persist } from 'zustand/middleware';
import { getLastChatId } from '../utils/lastOpenChatId';

interface useChatUIStoreProps {
  currentChatId: number | null;
  setCurrentChatId: (id: number | null) => void;
  isTyping: { userName: string | null; chatId: number | null; isTyping: boolean };
  setIsTyping: (userName: string, chatId: number, isTyping: boolean) => void;
  menuForMessage: Message | null;
  setMenuForMessage: (message: Message | null) => void;
  pinnedMode: boolean;
  setPinnedMode: (val: boolean) => void;
}

const useChatUIStore = create<useChatUIStoreProps>()(
  persist(
    (set) => ({
      currentChatId: getLastChatId(),
      isTyping: { userName: null, chatId: null, isTyping: false },
      menuForMessage: null,
      pinnedMode: false,

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
    }),
    {
      name: 'chat-ui-storage',
      partialize: (state) => ({
        currentChatId: state.currentChatId,
      }),
    },
  ),
);

export default useChatUIStore;
