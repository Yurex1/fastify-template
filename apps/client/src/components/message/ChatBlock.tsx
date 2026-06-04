import { cn } from '../../lib/utils';
import Time from '../Time';
import ChatMenu from '../ContextMenu';
import { deleteChat } from '../../services/chats';
import { useState } from 'react';
import { useUserStatus } from '../../stores/userStatus';
import { useAuthStore } from '../../stores/auth';
import type { Chat } from '../../api/chats/types';
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu';
import useChatUIStore from '../../stores/chatUI';
import { member } from '../../utils/isOwnMessage';

interface ChatBlockProps {
  chat: Chat;
  handleChangeChatId: (id: number | null) => void;
}

export const ChatBlock = ({ chat, handleChangeChatId }: ChatBlockProps) => {
  const user = useAuthStore((s) => s.currentUser);

  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const [menuForChat, setMenuForChat] = useState<Chat | null>(null);
  const stats = useUserStatus((s) => s.statuses);

  const handleDelete = async () => {
    if (menuForChat) {
      return await deleteChat(menuForChat.id);
    }
  };
  if (!user) return;
  const chatMember = member(chat, user.id);
  if (!chatMember) return;

  return (
    <ContextMenu key={chat.id}>
      <ContextMenuTrigger onContextMenu={() => setMenuForChat(chat)}>
        <div
          onClick={() => handleChangeChatId(chat.id)}
          className={cn(
            'flex gap-2 items-center p-2 cursor-pointer rounded-xl relative',
            currentChatId === chat.id ? 'bg-gray-900 text-white' : 'text-gray-400',
          )}
        >
          <img className="w-13 h-13 rounded-full" src="/user-no-icon.png" alt="user-icon" />
          {stats.includes(chatMember.userId) && (
            <span className="text-green-800 absolute text-[2.5em] top-0 right-2">•</span>
          )}

          <div className="w-full min-w-0">
            <div className="font-medium truncate text-white">{chatMember?.username || 'Unknown Chat'}</div>
            <div className="flex items-center justify-between min-w-0">
              {chat.lastMessage && (
                <div className="text-xs truncate min-w-0 flex-1 mr-2">
                  <span className="font-bold text-white">
                    {`${chat.lastMessage.userId === user?.id ? 'You' : chat.lastMessage.username}: `}
                  </span>
                  <span className="truncate">{chat.lastMessage.text}</span>
                </div>
              )}
              <div className="shrink-0">
                <Time date={chat.updatedAt} />
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ChatMenu onDelete={handleDelete} />
    </ContextMenu>
  );
};
