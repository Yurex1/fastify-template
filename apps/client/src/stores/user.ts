import { create } from "zustand";

interface UserState {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  clear: () => void;
}

const useUserStore = create<UserState>((set) => ({
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  clear: () => set({ currentUser: null }),
}));

export default useUserStore;
