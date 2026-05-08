import { create } from 'zustand';
import type { FormMode, Message, User } from '../api/types';

interface UserState {
  currentUser: User | null;
  accessToken: string | null;
  isTyping: { userName: string | null; chatId: number; isTyping: boolean };
  setIsTyping: (userName: string, chatId: number, isTyping: boolean) => void;
  setCurrentUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  formMode: FormMode;
  text: string;
  replyTo: Message | null;

  setFormMode: (mode: FormMode) => void;
  setText: (text: string) => void;
  setReplyTo: (message: Message | null) => void;
  menuForMessage: Message | null;
  setMenuForMessage: (message: Message) => void;
  clear: () => void;
}

import { persist } from 'zustand/middleware';

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isTyping: { userName: null, chatId: null, isTyping: false },
      menuForMessage: null,
      formMode: 'create',
      text: '',
      replyTo: null,

      setFormMode: (formMode) => set({ formMode }),
      setText: (text) => set({ text }),
      setReplyTo: (replyTo) => set({ replyTo }),

      setIsTyping: (userName, chatId, isTyping) => {
        set({
          isTyping: {
            userName,
            chatId,
            isTyping,
          },
        });
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),
      setMenuForMessage: (message) => set({ menuForMessage: message }),

      clear: () => set({ currentUser: null }),
    }),
    { name: 'user-storage' },
  ),
);

export default useUserStore;
