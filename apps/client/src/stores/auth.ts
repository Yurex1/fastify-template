import type { SignIn, SignUp, User } from '../api/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../api/auth/auth';

interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  login: (data: SignIn) => Promise<void>;
  register: (data: SignUp) => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (data) => {
        try {
          const res = await authService.signIn(data);
          useAuthStore.getState().setAccessToken(res.accessToken);
          set({ currentUser: res.user, isAuthenticated: true });
        } catch (error) {
          console.log(error);
        }
      },

      register: async (data) => {
        try {
          const res = await authService.signUp(data);
          useAuthStore.getState().setAccessToken(res.accessToken);
          set({ currentUser: res.user, isAuthenticated: true });
        } catch (error) {
          console.log(error);
        }
      },

      logout: async () => {
        try {
          await authService.signOut();
        } finally {
          useAuthStore.getState().clearAccessToken();
          set({ currentUser: null, isAuthenticated: false });
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),
      clear: () => set({ currentUser: null }),
    }),

    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    },
  ),
);
