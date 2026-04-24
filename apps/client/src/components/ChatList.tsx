import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchChats, deleteChat } from '../services/chats';
import { useAuthStore } from '../stores/auth';
import { setLastChatId } from '../utils/lastOpenChatId';
import { CreateChat } from './CreateChat';
import ChatMenu from './ContextMenu';
import { cn } from '../lib/utils';
import { ContextMenuTrigger, ContextMenu } from './ui/context-menu';
import { useState } from 'react';
import type { Chat } from '../api/types';
import { QueryKeys } from '../lib/queries';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmptyBlock } from './EmptyBlock';

interface ChatListProps {
  currentChatId: number | null;
  setCurrentChatId: (id: number) => void;
}

const ChatList = ({ currentChatId, setCurrentChatId }: ChatListProps) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [menuForChat, setMenuForChat] = useState<Chat | null>(null);

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.chats],
    queryFn: ({ pageParam = 1 }) => fetchChats({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 20 ? undefined : allPages.length + 1),
    enabled: !!currentChatId,
    staleTime: Infinity,
  });
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    rootMargin: '300px',
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId: number) => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.chats] });
    },
  });

  const handleDelete = () => {
    if (menuForChat) {
      deleteMutation.mutate(menuForChat.id);
    }
  };

  const handleChangeChatId = (chatId: number) => {
    setCurrentChatId(chatId);
    setLastChatId(chatId);
  };

  const chats = query.data?.pages.flat() || [];
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Chats</h2>

      <CreateChat />

      <div className={cn(' flex-1 w-full overflow-y-auto p-2')}>
        {chats.map((chat) => (
          <ContextMenu key={chat.id}>
            <ContextMenuTrigger onContextMenu={() => setMenuForChat(chat)}>
              <div
                onClick={() => handleChangeChatId(chat.id)}
                className={cn(
                  'p-4 cursor-pointer rounded-xl',
                  currentChatId === chat.id ? 'bg-gray-600  text-white' : 'text-gray-400 hover:bg-gray-900',
                )}
              >
                <p className="font-medium">{chat.members.find((m) => m.id !== user?.id)?.username || 'Unknown Chat'}</p>
                <small className="text-gray-300 !text-[10px] leading-[8px]">
                  {new Date(chat.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
                {/* <p>{chat.members.find((m) => m.id !== user?.id)?.isActive ? 'online' : 'offline'}</p> */}
              </div>
            </ContextMenuTrigger>
            <ChatMenu onDelete={handleDelete} />
          </ContextMenu>
        ))}
        <div ref={sentinelRef} className="h-1 w-full" />

        {query.isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 text-xs italic">Loading old messages...</div>
        )}

        {query.isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
        {!query.isLoading && chats.length === 0 && <EmptyBlock />}
      </div>
    </div>
  );
};

export default ChatList;
