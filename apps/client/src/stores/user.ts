import { create } from 'zustand';

interface UserState {}

import { persist } from 'zustand/middleware';

const useUserStore = create<UserState>()(persist((set) => ({}), { name: 'user-storage' }));

export default useUserStore;
