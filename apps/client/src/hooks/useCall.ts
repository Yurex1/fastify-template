import { useCallback } from 'react';
import useCallsStore from '../stores/calls';
import { useChatSocket } from '../websocket/ChatSocketContext';
import { useAuthStore } from '../stores/auth';

export function useCall(currentChatId: number | null) {
  const { createRoom } = useChatSocket();
  const currentUser = useAuthStore((s) => s.currentUser);
  const incomingCall = useCallsStore((s) => s.incomingCall);
  const activeRoomName = useCallsStore((s) => s.activeRoomName);
  const acceptCall = useCallsStore((s) => s.acceptCall);
  const declineCall = useCallsStore((s) => s.declineCall);
  const startCall = useCallsStore((s) => s.startCall);
  const endCall = useCallsStore((s) => s.endCall);

  const initiateCall = useCallback(() => {
    if (!currentChatId || !currentUser) return;
    const roomName = `chat-${currentChatId}`;
    createRoom(currentChatId, roomName, currentUser?.username);
    startCall(roomName);
  }, [currentChatId, createRoom, startCall]);

  return {
    incomingCall,
    activeRoomName,
    isInCall: !!activeRoomName,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
  };
}
