import { Dot } from 'lucide-react';
import { cn } from '../../lib/utils';
import Time from '../Time';
import ChatMenu from '../ContextMenu';
import { deleteChat } from '../../services/chats';
import { useState } from 'react';
import { useUserStatus } from '../../stores/userStatus';
import { useAuthStore } from '../../stores/auth';
import type { Chat } from '../../api/chats/types';
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu';

interface ChatBlockProps {
  chat: Chat;
  currentChatId: number | null;
  handleChangeChatId: (id: number | null) => void;
}

export const ChatBlock = ({ chat, currentChatId, handleChangeChatId }: ChatBlockProps) => {
  const user = useAuthStore((s) => s.currentUser);

  const member = (chat: Chat) => {
    return chat.members.find((m) => (m.id || m.userId) !== user?.id);
  };

  const [menuForChat, setMenuForChat] = useState<Chat | null>(null);
  const stats = useUserStatus((s) => s.statuses);
  const lastseen = useUserStatus((s) => s.lastSeenMap);

  const handleDelete = async () => {
    if (menuForChat) {
      return await deleteChat(menuForChat.id);
    }
  };

  const chatMember = member(chat);
  if (!chatMember) return;

  return (
    <ContextMenu key={chat.id}>
      <ContextMenuTrigger onContextMenu={() => setMenuForChat(chat)}>
        <div
          onClick={() => handleChangeChatId(chat.id)}
          className={cn(
            'p-4 cursor-pointer rounded-xl relative',
            currentChatId === chat.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-800',
          )}
        >
          <p className="font-medium">{chatMember?.username || 'Unknown Chat'}</p>
          <Time date={chat.updatedAt} />

          {stats.includes(chatMember.id) && (
            <div className="absolute top-0 right-0 text-green-800">
              <Dot size={60} />
            </div>
          )}
          {!stats.includes(chatMember.id) && (
            <Time
              date={lastseen[chatMember.id] || chatMember.lastseen || ''}
              text="Last seen:"
              additionalStyles="opacity-[0.4] absolute bottom-2 right-2"
            />
          )}
        </div>
      </ContextMenuTrigger>
      <ChatMenu onDelete={handleDelete} />
    </ContextMenu>
  );
};
