import { useEffect, useRef, useState } from 'react';
import useUserStore from '../stores/user';
import { MESSAGE_TYPES } from '../utils/consts/messageTypes';
import { useChatMessages } from './useChatMessages';

const WS_URL = import.meta.env.VITE_WS_URL;

interface UseWebSocketProps {
  currentChatId: number | null;
}

export function useWebSocket({ currentChatId }: UseWebSocketProps) {
  const token = useUserStore((s) => s.accessToken);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { updateMessageCache } = useChatMessages({
    currentChatId,
  });
  const onMessageReceivedRef = useRef(updateMessageCache);

  useEffect(() => {
    onMessageReceivedRef.current = updateMessageCache;
  }, [updateMessageCache]);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_URL}/ws/${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === MESSAGE_TYPES.new) {
        onMessageReceivedRef.current({ type: 'add', payload: data.payload });
      }
      if (data.type === MESSAGE_TYPES.updated) {
        onMessageReceivedRef.current({ type: 'update', payload: data.payload });
      }
      if (data.type === MESSAGE_TYPES.deleted) {
        onMessageReceivedRef.current({ type: 'delete', payload: data.payload });
      }
    };

    socket.onopen = () => setWs(socket);
    socket.onclose = () => setWs(null);

    return () => socket.close();
  }, [token]);

  const sendMessage = (chatId: number, text: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.send, payload: { chatId, text: text.trim() } }));
  };

  const updateMessage = (messageId: number, text: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.update, payload: { messageId, text: text.trim() } }));
  };

  const deleteMessage = (messageId: number) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.delete, payload: { messageId } }));
  };

  return { sendMessage, updateMessage, deleteMessage };
}
