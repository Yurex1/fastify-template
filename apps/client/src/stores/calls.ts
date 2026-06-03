import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CallsStore {
  incomingCall: {
    chatId: number;
    roomName: string;
    chatName: string;
    type: 'audio' | 'video';
  } | null;

  activeCall: {
    roomName: string;
    type: 'audio' | 'video';
  } | null;

  setIncomingCall: (chatId: number, roomName: string, chatName: string, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  declineCall: () => void;
  startCall: (roomName: string, type: 'audio' | 'video') => void;
  endCall: () => void;
  reset: () => void;
}

const useCallsStore = create<CallsStore>()(
  persist(
    (set, get) => ({
      incomingCall: null,
      activeCall: null,

      setIncomingCall: (chatId, roomName, chatName, type) =>
        set({ incomingCall: { chatId, roomName, chatName, type } }),

      acceptCall: () => {
        const { incomingCall } = get();
        if (!incomingCall) return;

        set({
          activeCall: { roomName: incomingCall.roomName, type: incomingCall.type },
          incomingCall: null,
        });
      },

      declineCall: () => set({ incomingCall: null }),

      startCall: (roomName, type) => set({ activeCall: { roomName, type } }),

      endCall: () => set({ activeCall: null, incomingCall: null }),
      reset: () => set({ incomingCall: null, activeCall: null }),
    }),
    {
      name: 'calls-storage',
      partialize: (state) => ({
        incomingCall: state.incomingCall,
        activeCall: state.activeCall,
      }),
    },
  ),
);

export default useCallsStore;
