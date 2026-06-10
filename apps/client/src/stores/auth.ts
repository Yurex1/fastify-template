import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../api/auth/auth';
import type { User } from '../api/user/types';
import type { SignIn, SignUp } from '../api/auth/types';
import useCallsStore from './calls';
import useChatUIStore from './chatUI';
import auth from '../api/auth/auth';

interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  setCurrentUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  login: (data: SignIn) => Promise<void>;
  register: (data: SignUp) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (data) => {
        const res = await authService.signIn(data);
        useAuthStore.getState().setAccessToken(res.accessToken);
        set({ currentUser: res.user, isAuthenticated: true });
      },

      register: async (data) => {
        const res = await authService.signUp(data);
        useAuthStore.getState().setAccessToken(res.accessToken);
        set({ currentUser: res.user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authService.signOut();
        } finally {
          useAuthStore.getState().clearAccessToken();
          set({ currentUser: null, isAuthenticated: false });
          useCallsStore.getState().reset();
          useChatUIStore.getState().reset();

          sessionStorage.clear();
          localStorage.clear();

          window.location.href = '/login';
        }
      },

      loginWithGoogle: async (credential) => {
        const session = await auth.signInWithGoogle(credential);
        set({ accessToken: session.accessToken, currentUser: session.user, isAuthenticated: true });
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),
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
