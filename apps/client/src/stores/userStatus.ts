import { create } from 'zustand';

interface UserStatusStore {
  statuses: number[];
  lastSeenMap: Record<number, string>;

  setStatuses: (newStatuses: Array<{ userId: number; isOnline: boolean; lastseen?: string }>) => void;

  updateStatus: (userId: number, isOnline: boolean, lastseen?: string) => void;
}

export const useUserStatus = create<UserStatusStore>((set) => ({
  statuses: [],
  lastSeenMap: {},

  setStatuses: (newStatuses) => {
    const onlineIds: number[] = [];
    const lastSeenMap: Record<number, string> = {};

    newStatuses.forEach(({ userId, isOnline, lastseen }) => {
      if (isOnline) {
        onlineIds.push(userId);
      } else if (lastseen) {
        lastSeenMap[userId] = lastseen;
      }
    });

    set({ statuses: onlineIds, lastSeenMap });
  },

  updateStatus: (userId, isOnline, lastseen) =>
    set((state) => {
      let newOnline = [...state.statuses];
      let newLastSeenMap = { ...state.lastSeenMap };

      if (isOnline) {
        if (!newOnline.includes(userId)) newOnline.push(userId);
        delete newLastSeenMap[userId];
      } else {
        newOnline = newOnline.filter((id) => id !== userId);
        if (lastseen) newLastSeenMap[userId] = lastseen;
      }

      return {
        statuses: newOnline,
        lastSeenMap: newLastSeenMap,
      };
    }),
}));
