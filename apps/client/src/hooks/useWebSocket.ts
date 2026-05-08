import { useEffect, useRef, useState } from 'react';
import useUserStore from '../stores/user';
import { MESSAGE_TYPES } from '../utils/consts/messageTypes';
import { useChatMessages } from './useChatMessages';
import { CHAT_TYPES } from '../utils/consts/chatTypes';
import { useChats } from './useChats';
import { USER_TYPES } from '../utils/consts/userTypes';

import { usePinnedMessages } from './usePinnedMessages';
import { useUserStatus } from '../stores/userStatus';

const WS_URL = import.meta.env.VITE_WS_URL;

interface UseWebSocketProps {
  currentChatId: number | null;
}

export function useWebSocket({ currentChatId }: UseWebSocketProps) {
  const token = useUserStore((s) => s.accessToken);
  const setIsTyping = useUserStore((s) => s.setIsTyping);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const { updateMessageCache } = useChatMessages({
    currentChatId,
  });
  const { updateChatsCache } = useChats();
  const { updatePinnedMessagesCache } = usePinnedMessages({ currentChatId });

  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    const scheduleReconnect = () => {
      if (!isActive || reconnectTimeoutRef.current) return;

      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectTimeoutRef.current = null;
        if (isActive && token) {
          connect();
        }
      }, 3000);
    };

    const clearReconnect = () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const connect = () => {
      const socket = new WebSocket(`${WS_URL}/ws?token=${token}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const chatId = currentChatIdRef.current;

        console.log('🔵 WS RECEIVED:', data.type, data);

        switch (data.type) {
          case MESSAGE_TYPES.new:
            updateMessageCache(chatId, { type: 'add', payload: data.payload });
            updateChatsCache(CHAT_TYPES.update, chatId, data.payload);
            break;

          case MESSAGE_TYPES.updated:
          case MESSAGE_TYPES.updatedRection:
            updateMessageCache(chatId, { type: 'update', payload: data.payload });
            break;

          case MESSAGE_TYPES.deleted:
            updateMessageCache(chatId, { type: 'delete', payload: data.payload });
            updateChatsCache(CHAT_TYPES.delete, chatId, data.payload);
            break;

          case USER_TYPES.getInitialStatus:
            useUserStatus.getState().setStatuses(data.payload);
            break;

          case USER_TYPES.getStatus:
            const { userId, isOnline, lastseen } = data.payload;
            useUserStatus.getState().updateStatus(userId, isOnline, lastseen);
            break;

          case CHAT_TYPES.created:
            updateChatsCache('create', chatId, data.payload);
            break;

          case MESSAGE_TYPES.isTyping:
            setIsTyping(data.payload.userName, data.payload.chatId, true);
            break;

          case MESSAGE_TYPES.stopTyping:
            setIsTyping(data.payload.userName, data.payload.chatId, false);
            break;

          case MESSAGE_TYPES.pinned: {
            const { messageId, isPinned }: { messageId: number; isPinned: boolean } = data.payload;
            updateMessageCache(chatId, {
              type: 'pin',
              payload: { messageId, isPinned },
            });
            updatePinnedMessagesCache('pin', data.payload);
            break;
          }

          case MESSAGE_TYPES.unpinnedMessage: {
            const { chatId: payloadChatId, messageId } = data.payload;
            updateMessageCache(payloadChatId, {
              type: 'unpin',
              payload: { chatId: payloadChatId, messageId },
            });
            updatePinnedMessagesCache('unpin', data.payload);
            break;
          }

          default:
            break;
        }
      };

      socket.onopen = () => {
        setWs(socket);
        clearReconnect();
      };

      socket.onerror = () => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
        }
      };

      socket.onclose = () => {
        setWs(null);
        socketRef.current = null;
        if (isActive) {
          scheduleReconnect();
        }
      };
    };

    connect();

    return () => {
      isActive = false;
      clearReconnect();
      socketRef.current?.close();
      socketRef.current = null;
      setWs(null);
    };
  }, [token]);

  const sendMessage = (chatId: number, text: string, reply_id?: number) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.send, payload: { chatId, text: text.trim(), reply_id } }));
  };

  const updateMessage = (messageId: number, definition: { type: string; content: 'text' }) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.update, payload: { messageId, definition } }));
  };
  const updateReaction = (id: number, userId: number, reaction: string) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.updateReaction, payload: { id, userId, reaction } }));
  };

  const deleteMessage = (messageId: number) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.delete, payload: { messageId } }));
  };

  const typing = (chatId: number) => {
    ws?.send(JSON.stringify({ type: MESSAGE_TYPES.isTyping, payload: { chatId } }));
  };

  return { sendMessage, updateMessage, updateReaction, deleteMessage, typing };
}
