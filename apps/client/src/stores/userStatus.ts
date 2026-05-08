import { create } from 'zustand';
import { parseStatuses } from '../utils/userStatus';

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
    const { onlineIds, lastSeenMap } = parseStatuses(newStatuses);
    set({
      statuses: Array.from(onlineIds),
      lastSeenMap,
    });
  },

  updateStatus: (userId, isOnline, lastseen) =>
    set((state) => {
      let nextStatuses = [...state.statuses];
      if (isOnline) {
        if (!nextStatuses.includes(userId)) nextStatuses.push(userId);
      } else {
        nextStatuses = nextStatuses.filter((id) => id !== userId);
      }

      const nextLastSeenMap = { ...state.lastSeenMap };
      if (isOnline) {
        delete nextLastSeenMap[userId];
      } else if (lastseen) {
        nextLastSeenMap[userId] = lastseen;
      }

      return {
        statuses: nextStatuses,
        lastSeenMap: nextLastSeenMap,
      };
    }),
}));
