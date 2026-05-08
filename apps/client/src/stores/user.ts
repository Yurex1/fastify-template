import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {}

const useUserStore = create<UserState>()(persist((set) => ({}), { name: 'user-storage' }));

export default useUserStore;
