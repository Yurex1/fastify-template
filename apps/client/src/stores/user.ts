import { create } from 'zustand';
import type { User } from '../api/types';

interface UserState {
  currentUser: User | null;
  accessToken: string | null;

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

      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),

      clear: () => set({ currentUser: null }),
    }),
    { name: 'user-storage' },
  ),
);

export default useUserStore;
