import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChats, deleteChat } from '../services/chats';
import { useAuthStore } from '../stores/auth';
import { setLastChatId } from '../utils/lastOpenChatId';
import { CreateChat } from './CreateChat';
import ChatMenu from './ContextMenu';
import { cn } from '../lib/utils';
import { ContextMenuTrigger, ContextMenu } from './ui/context-menu';
import { useState } from 'react';
import type { Chat } from '../api/types';

interface ChatListProps {
  currentChatId: number | null;
  setCurrentChatId: (id: number) => void;
}

const ChatList = ({ currentChatId, setCurrentChatId }: ChatListProps) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [menuForChat, setMenuForChat] = useState<Chat | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId: number) => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
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

  if (isLoading) return <p>Chats loading...</p>;

  return (
    <>
      <div className="w-full h-full h-screen overflow-hidden">
        <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Chats</h2>

        <CreateChat />

        <div className={cn('h-full w-full overflow-y-auto p-2  transition-all duration-500')}>
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
                  <p className="font-medium">
                    {chat.members.find((m) => m.id !== user?.id)?.username || 'Unknown Chat'}
                  </p>
                </div>
              </ContextMenuTrigger>
              <ChatMenu onDelete={handleDelete} />
            </ContextMenu>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatList;
