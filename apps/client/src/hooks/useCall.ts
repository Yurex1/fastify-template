import { useCallback } from 'react';
import useCallsStore from '../stores/calls';
import { useChatSocket } from '../websocket/ChatSocketContext';
import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';

export function useCall(currentChatId: number | null) {
  const { createRoom } = useChatSocket();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { incomingCall, activeCall, acceptCall, declineCall, startCall, endCall } = useCallsStore(
    useShallow((s) => ({
      incomingCall: s.incomingCall,
      activeCall: s.activeCall,
      acceptCall: s.acceptCall,
      declineCall: s.declineCall,
      startCall: s.startCall,
      endCall: s.endCall,
    })),
  );

  const initiateCall = useCallback(
    (type: 'audio' | 'video') => {
      if (!currentChatId || !currentUser) return;
      const roomName = `chat-${currentChatId}`;
      createRoom(currentChatId, roomName, currentUser?.username, type);
      startCall(roomName, type);
    },
    [currentChatId, createRoom, startCall],
  );

  return {
    incomingCall,
    activeCall,
    isInCall: !!activeCall,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
  };
}
