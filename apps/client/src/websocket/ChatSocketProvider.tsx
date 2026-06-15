import { useEffect, useMemo, useRef } from 'react';
import { ChatSocketContext, type ChatSocketContextProps } from './ChatSocketContext';
import { useAuthStore } from '../stores/auth';
import { handleSocketMessage } from './handleSocketMessage';
import { useQueryClient } from '@tanstack/react-query';
import { WS_OUT } from './consts/messageEvents';
import { QueryKeys } from '../lib/queries';
import type { InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import type { MessageList, MessagePageParam } from '../api/chats/types';
import { getDeviceId } from '../utils/deviceId';

const WS_URL = import.meta.env.VITE_WS_URL;
const deviceId = getDeviceId();

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fillGap = async () => {
    const queries = queryClient.getQueriesData<InfiniteData<MessageList, MessagePageParam>>({
      queryKey: [QueryKeys.messages],
    });

    await Promise.allSettled(
      queries.map(async ([queryKey, data]) => {
        if (!data?.pages?.length) return;

        const chatId = queryKey[1] as number;

        const newestId = data.pages[0]?.messages[0]?.id;
        if (!newestId) return;

        const result = await chatsApi.getMessagesByChatId(chatId, { after: newestId });
        if (!result.messages.length) return;

        queryClient.setQueryData<InfiniteData<MessageList, MessagePageParam>>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, i) =>
              i === 0 ? { ...page, messages: [...result.messages, ...page.messages] } : page,
            ),
          };
        });
      }),
    );
  };

  useEffect(() => {
    let isFirstConnect = true;
    let active = true;

    const connect = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      const token = useAuthStore.getState().accessToken;
      if (!token) return;
      const socket = new WebSocket(`${WS_URL}/ws?deviceId=${deviceId}`, token);
      socketRef.current = socket;

      socket.onopen = () => {
        if (reconnectRef.current) clearTimeout(reconnectRef.current);

        if (isFirstConnect) {
          isFirstConnect = false;
        } else {
          fillGap();
        }
      };

      socket.onmessage = (event) => handleSocketMessage(event, queryClient);

      socket.onerror = () => {
        if (socket.readyState !== WebSocket.OPEN) socket.close();
      };

      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        if (active) reconnectRef.current = setTimeout(connect, 3000);
      };
    };

    connect();
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (state.accessToken !== prevState.accessToken) {
        if (state.accessToken) {
          if (socketRef.current) {
            socketRef.current.close();
          }

          connect();
        } else {
          if (socketRef.current) {
            socketRef.current.close();
          }
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
      isFirstConnect = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [fillGap, queryClient]);

  const api: ChatSocketContextProps = useMemo(
    () => ({
      sendMessage: (chatId, text, reply_id) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.SEND_MESSAGE, payload: { chatId, text, reply_id } })),
      updateMessage: (messageId, definition) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.UPDATE_MESSAGE, payload: { messageId, definition } })),
      updateReaction: (id, userId, reaction, chatId) =>
        socketRef.current?.send(
          JSON.stringify({ type: WS_OUT.UPDATE_REACTION, payload: { id, userId, reaction, chatId } }),
        ),
      deleteMessage: (messageId) =>
        socketRef.current?.send(JSON.stringify({ type: WS_OUT.DELETE_MESSAGE, payload: { messageId } })),
      typing: (chatId) => socketRef.current?.send(JSON.stringify({ type: WS_OUT.IS_TYPING, payload: { chatId } })),

      createRoom: (chatId, roomName, chatName, type) =>
        socketRef.current?.send(
          JSON.stringify({ type: WS_OUT.OUTGOING_CALL, payload: { chatId, roomName, chatName, type } }),
        ),
    }),
    [],
  );

  return <ChatSocketContext.Provider value={api}>{children}</ChatSocketContext.Provider>;
}
