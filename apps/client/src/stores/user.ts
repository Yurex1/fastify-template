import { create } from 'zustand';
import type { User } from '../api/types';

interface UserState {
  currentUser: User | null;
  accessToken: string | null;
  isTyping: { userName: string | null; isTyping: boolean };
  setIsTyping: (userName: string, isTyping: boolean) => void;
  setCurrentUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  clear: () => void;
}

import { persist } from 'zustand/middleware';

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isTyping: { userName: null, isTyping: false },

      setIsTyping: (userName, isTyping) => {
        set({
          isTyping: {
            userName,
            isTyping,
          },
        });
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),

      clear: () => set({ currentUser: null }),
    }),
    { name: 'user-storage' },
  ),
);

export default useUserStore;
