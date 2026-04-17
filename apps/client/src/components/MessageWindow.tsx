import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { getAccessToken } from '../utils/auth/accessToken';
import chatsApi from '../api/chats/chats';
import createWebSocket, { deleteMessage } from '../services/chatSocket';
import type { FormMode, Message } from '../api/auth/types';
import MessageForm from './MessageForm';
import FloatingMenu from './MessageMenu';
import { EmptyBlock } from './EmptyBlock';

const MessageWindow = ({ currentChatId }: { currentChatId: number | null }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [text, setText] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const currentUser = useAuthStore((state) => state.user);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef(currentChatId);
  const token = getAccessToken();

  const [menuConfig, setMenuConfig] = useState<{
    anchor: HTMLDivElement;
    message: Message;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = createWebSocket(token, chatIdRef, setWs, setMessages);
    return () => socket?.close();
  }, [token]);

  useEffect(() => {
    chatIdRef.current = currentChatId;
    setMessages([]);
    setPage(1);
    setHasMore(true);
    if (currentChatId) {
      loadMessages(currentChatId, 1, true);
    }
  }, [currentChatId]);

  const loadMessages = async (chatId: number, currentPage: number, isInitial = false) => {
    if (isLoading || (!hasMore && !isInitial)) return;

    const container = scrollContainerRef.current;
    const previousHeight = container?.scrollHeight || 0;

    try {
      setIsLoading(true);
      const response = (await chatsApi.getMessageByChatId(chatId, currentPage)) as Message[];

      if (response.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => (isInitial ? response : [...response, ...prev]));

      if (!isInitial && container) {
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - previousHeight;
        });
      }

      if (isInitial) {
        requestAnimationFrame(() => {
          if (container) container.scrollTop = container.scrollHeight;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore && currentChatId) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.2 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore, currentChatId]);

  useEffect(() => {
    if (page > 1 && currentChatId) {
      loadMessages(currentChatId, page);
    }
  }, [page]);

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">Виберіть чат</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 flex flex-col">
        <div ref={sentinelRef} className="h-1 w-full" />

        {isLoading && <div className="text-center py-2 text-gray-500 text-xs">Завантаження...</div>}
        {messages.length === 0 && <EmptyBlock />}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                if (message.userId === currentUser.id) setMenuConfig({ anchor: e.currentTarget, message });
              }}
              className={`px-3 py-2 rounded-2xl max-w-[70%] ${
                message.userId === currentUser.id
                  ? 'bg-violet-700 text-white rounded-tr-none'
                  : 'bg-gray-800 text-white rounded-tl-none'
              }`}
            >
              <p className="text-sm break-words leading-[20px]">{message.text}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                {message.createdAt !== message.updatedAt && (
                  <p className="text-[10px] opacity-[0.7] leading-[8px]">edited</p>
                )}
                <small className="text-gray-300 !text-[10px] leading-[8px]">
                  {new Date(message.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!!menuConfig && (
        <FloatingMenu
          anchorEl={menuConfig.anchor}
          isOpen={!!menuConfig}
          onClose={() => setMenuConfig(null)}
          onEdit={() => {
            setFormMode('edit');
            setMessageToEdit(menuConfig.message);
            setText(menuConfig.message.text);
          }}
          onDelete={() => deleteMessage(ws, menuConfig.message.id)}
        />
      )}

      <MessageForm
        currentChatId={currentChatId}
        ws={ws}
        text={text}
        formMode={formMode}
        messageToEdit={messageToEdit}
        setText={setText}
        setFormMode={setFormMode}
        setMessageToEdit={setMessageToEdit}
      />
    </div>
  );
};

export default MessageWindow;
