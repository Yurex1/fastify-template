import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChat, fetchChats } from '../services/chats';
import { useAuthStore } from '../stores/auth';
import { setLastChatId } from '../utils/lastOpenChatId';
import { CreateChat } from './CreateChat';
import ChatMenu from './ContextMenu';
import { cn } from '../lib/utils';
import { ContextMenuTrigger, ContextMenu } from './ui/context-menu';
import { useEffect, useState } from 'react';
import type { Chat } from '../api/types';
import { QueryKeys } from '../lib/queries';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmptyBlock } from './EmptyBlock';
import { useChats } from '../hooks/useChats';
import { Dot } from 'lucide-react';
import Time from './Time';

interface ChatListProps {
  currentChatId: number | null;
  setCurrentChatId: (id: number) => void;
}

const ChatList = ({ currentChatId, setCurrentChatId }: ChatListProps) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [menuForChat, setMenuForChat] = useState<Chat | null>(null);

  const query = useChats({ currentChatId });
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

  const isOnline = (chat: Chat) => {
    return chat.members.find((m) => m.userId !== user?.id)?.isOnline;
  };

  const member = (chat: Chat) => {
    return chat.members.find((m) => m.userId !== user?.id);
  };

  useEffect(() => {
    fetchChats({ page: 1 });
  }, [query.data]);

  const chats = query.data?.pages.flat() || [];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Chats</h2>

      <CreateChat />

      <div className="flex-1 w-full overflow-y-auto p-2">
        {chats.map((chat) => (
          <ContextMenu key={chat.id}>
            <ContextMenuTrigger onContextMenu={() => setMenuForChat(chat)}>
              <div
                onClick={() => handleChangeChatId(chat.id)}
                className={cn(
                  'p-4 cursor-pointer rounded-xl relative',
                  currentChatId === chat.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-800',
                )}
              >
                <p className="font-medium">{member(chat)?.username || 'Unknown Chat'}</p>
                <Time date={chat.updatedAt} />

                {!!isOnline(chat) && (
                  <div className="absolute top-0 right-0 text-green-800">
                    <Dot size={60} />
                  </div>
                )}
                {!isOnline(chat) && (
                  <Time
                    date={member(chat)?.lastseen || ''}
                    text="Last seen:"
                    additionalStyles="opacity-[0.4] absolute bottom-0 right-0"
                  />
                )}
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
