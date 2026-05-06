import type { SignIn, SignUp, User } from '../api/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../api/auth/auth';
import useUserStore from './user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: SignIn) => Promise<void>;
  register: (data: SignUp) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (data) => {
        try {
          const res = await authService.signIn(data);
          useUserStore.getState().setAccessToken(res.accessToken);
          set({ user: res.user, isAuthenticated: true });
        } catch (error) {
          console.log(error);
        }
      },

      register: async (data) => {
        try {
          const res = await authService.signUp(data);
          useUserStore.getState().setAccessToken(res.accessToken);
          set({ user: res.user, isAuthenticated: true });
        } catch (error) {
          console.log(error);
        }
      },

      logout: async () => {
        try {
          await authService.signOut();
        } finally {
          useUserStore.getState().clearAccessToken();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
