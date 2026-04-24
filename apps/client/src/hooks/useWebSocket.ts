import { useEffect, useRef, useState } from 'react';
import useUserStore from '../stores/user';
import { MESSAGE_TYPES } from '../utils/consts/messageTypes';
import { useChatMessages } from './useChatMessages';
import { CHAT_TYPES } from '../utils/consts/chatTypes';
import { useAuthStore } from '../stores/auth';

const WS_URL = import.meta.env.VITE_WS_URL;

interface UseWebSocketProps {
  currentChatId: number | null;
}

export function useWebSocket({ currentChatId }: UseWebSocketProps) {
  const token = useUserStore((s) => s.accessToken);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const userId = useAuthStore((s) => s.user).id;
  const { updateMessageCache, updateChatsCache } = useChatMessages({
    currentChatId,
  });
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_URL}/ws/${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const chatId = currentChatIdRef.current;

      if (data.type === MESSAGE_TYPES.new) {
        updateMessageCache(chatId, { type: 'add', payload: data.payload });
        updateChatsCache(CHAT_TYPES.update, chatId, data.payload.createdAt);
      }

      if (data.type === MESSAGE_TYPES.updated) {
        updateMessageCache(chatId, { type: 'update', payload: data.payload });
      }
      if (data.type === MESSAGE_TYPES.deleted) {
        updateMessageCache(chatId, { type: 'delete', payload: data.payload });
      }

      if (data.type === MESSAGE_TYPES.getStatus) {
        console.log(data.payload);
      }
    };

    socket.onopen = () => {
      setWs(socket);
      socket.send(JSON.stringify({ type: MESSAGE_TYPES.status, payload: { userId, isActive: true } }));
    };
    socket.onclose = () => {
      setWs(null);
      // socket.send(JSON.stringify({ type: MESSAGE_TYPES.status, payload: { userId, isActive: false } }));
    };

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
