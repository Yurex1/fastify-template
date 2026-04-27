import { useEffect, useRef, useState } from 'react';
import useUserStore from '../stores/user';
import { MESSAGE_TYPES } from '../utils/consts/messageTypes';
import { useChatMessages } from './useChatMessages';
import { CHAT_TYPES } from '../utils/consts/chatTypes';
import { useChats } from './useChats';
import { USER_TYPES } from '../utils/consts/userTypes';

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
  const { updateChatsCache } = useChats({ currentChatId });

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
        updateChatsCache(CHAT_TYPES.update, chatId, data.payload);
      }

      if (data.type === MESSAGE_TYPES.updated) {
        updateMessageCache(chatId, { type: 'update', payload: data.payload });
      }

      if (data.type === MESSAGE_TYPES.updatedRection) {
        updateMessageCache(chatId, { type: 'update', payload: data.payload });
      }

      if (data.type === MESSAGE_TYPES.deleted) {
        updateMessageCache(chatId, { type: 'delete', payload: data.payload });
        updateChatsCache(CHAT_TYPES.delete, chatId, data.payload);
      }

      if (data.type === USER_TYPES.getStatus) {
        updateChatsCache(data.type, chatId, data.payload);
      }

      if (data.type === USER_TYPES.getInitialStatus) {
        updateChatsCache(data.type, chatId, data.payload);
      }
    };

    socket.onopen = () => {
      setWs(socket);
    };
    socket.onclose = () => {
      setWs(null);
    };

    return () => socket.close();
  }, [token]);

  const sendMessage = (chatId: number, text: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.send, payload: { chatId, text: text.trim() } }));
  };

  const updateMessage = (messageId: number, text: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.update, payload: { messageId, text: text.trim() } }));
  };
  const updateReaction = (id: number, userId: number, reaction: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.updateReaction, payload: { id, userId, reaction } }));
  };

  const deleteMessage = (messageId: number) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.delete, payload: { messageId } }));
  };

  return { sendMessage, updateMessage, updateReaction, deleteMessage };
}
