import { useEffect, useMemo, useRef } from 'react';
import { ChatSocketContext, type ChatSocketContextProps } from './ChatSocketContext';
import { useAuthStore } from '../stores/auth';
import { handleSocketMessage } from './handleSocketMessage';
import { useQueryClient } from '@tanstack/react-query';
import { WS_OUT } from './consts/messageEvents';

const WS_URL = import.meta.env.VITE_WS_URL;

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;

    const connect = () => {
      // const socket = new WebSocket(`${WS_URL}/ws?token=${token}`)

      const socket = new WebSocket(`${WS_URL}/ws`, token);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      };

      socket.onmessage = (event) => {
        handleSocketMessage(event, queryClient);
      };

      socket.onerror = () => {
        if (socket.readyState !== WebSocket.OPEN) socket.close();
      };
      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        if (active) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [token]);

  const api: ChatSocketContextProps = useMemo(
    () => ({
      sendMessage: (chatId, text, reply_id) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.SEND_MESSAGE, payload: { chatId, text, reply_id } })),

      updateMessage: (messageId, definition) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.UPDATE_MESSAGE, payload: { messageId, definition } })),

      updateReaction: (id, userId, reaction) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.UPDATE_REACTION, payload: { id, userId, reaction } })),

      deleteMessage: (messageId) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.DELETE_MESSAGE, payload: { messageId } })),

      typing: (chatId) => socketRef.current?.send(JSON.stringify({ type: WS_OUT.IS_TYPING, payload: { chatId } })),
    }),
    [],
  );

  return <ChatSocketContext.Provider value={api}>{children}</ChatSocketContext.Provider>;
}
