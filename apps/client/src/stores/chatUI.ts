import { create } from 'zustand';
import type { Message } from '../api/types';

interface useChatUIStoreProps {
  isTyping: { userName: string | null; chatId: number; isTyping: boolean };
  setIsTyping: (userName: string, chatId: number, isTyping: boolean) => void;
  menuForMessage: Message | null;
  setMenuForMessage: (message: Message) => void;
}

import { persist } from 'zustand/middleware';

const useChatUIStore = create<useChatUIStoreProps>()(
  persist(
    (set) => ({
      isTyping: { userName: null, chatId: null, isTyping: false },
      menuForMessage: null,

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
    { name: 'chat-ui-storage' },
  ),
);

export default useChatUIStore;
