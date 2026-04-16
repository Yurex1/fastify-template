import type { SignIn, SignUp, User } from "../api/auth/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../api/auth/auth";
import { setAccessToken, clearAccessToken } from "../utils/auth/accessToken";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: SignIn) => Promise<void>;
  register: (data: SignUp) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.signIn(data);
          console.log(res);
          setAccessToken(res.accessToken);
          set({ user: res.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.signUp(data);
          setAccessToken(res.accessToken);
          set({ user: res.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authService.signOut();
        } finally {
          clearAccessToken();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
