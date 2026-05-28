import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CallsStore {
  incomingCall: { chatId: number; roomName: string; chatName: string } | null;
  activeRoomName: string | null;
  setIncomingCall: (chatId: number, roomName: string, chatName: string) => void;
  acceptCall: () => void;
  declineCall: () => void;
  startCall: (roomName: string) => void;
  endCall: () => void;
}

const useCallsStore = create<CallsStore>()(
  persist(
    (set, get) => ({
      incomingCall: null,
      activeRoomName: null,

      setIncomingCall: (chatId, roomName, chatName) => set({ incomingCall: { chatId, roomName, chatName } }),

      acceptCall: () => {
        const { incomingCall } = get();
        if (!incomingCall) return;
        set({ activeRoomName: incomingCall.roomName, incomingCall: null });
      },

      declineCall: () => set({ incomingCall: null }),

      startCall: (roomName) => set({ activeRoomName: roomName }),

      endCall: () => set({ activeRoomName: null }),
    }),
    {
      name: 'calls-storage',
      partialize: (state) => ({
        incomingCall: state.incomingCall,
        activeRoomName: state.activeRoomName,
      }),
    },
  ),
);

export default useCallsStore;
