import { cn } from '../lib/utils';
import { EmojiMenu } from '../components/EmojiMenu';
import { ReactionList, userPressedEmojis } from '../components/ReactionList';
import Time from '../components/Time';
import MessageMenu from '../components/ContextMenu';
import { ContextMenu, ContextMenuTrigger } from '../components/ui/context-menu';
import { useAuthStore } from '../stores/auth';
import { Pin } from 'lucide-react';
import chatsApi from '../api/chats/chats';
import { isOwnMessage } from '../utils/isOwnMessage';
import { useMessageActions } from '../hooks/useMessageActions';
import useChatUIStore from '../stores/chatUI';
import type { Message } from '../api/chats/types';

interface MessageBlockProps {
  message: Message;
  updateReaction: (id: number, userId: number, reaction: string) => void;
  deleteMessage: (id: number) => void;
  scrollToMessage?: (id: number) => void;
}

export const MessageBlock = ({ message, updateReaction, deleteMessage, scrollToMessage }: MessageBlockProps) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setMenuForMessage = useChatUIStore((s) => s.setMenuForMessage);

  const { handleEdit, handleCopy, handleReply, handleDelete } = useMessageActions({
    deleteMessage,
  });

  if (!currentUser) return null;
  const isOwn = isOwnMessage(message.userId, currentUser.id);

  function togglePin() {
    if (message.isPinned) chatsApi.unpinMessage(message.chatId, message.id);
    else chatsApi.pinMessage(message.chatId, message.id);
  }

  if (!message) return null;

  return (
    <div
      id={`message-${message.id}`}
      className={cn('flex mb-1 whitespace-pre-wrap break-words px-4', isOwn ? 'justify-end' : 'justify-start')}
    >
      <ContextMenu>
        <ContextMenuTrigger
          onContextMenu={() => {
            setMenuForMessage(message);
          }}
          asChild
        >
          <div
            onDoubleClick={() => updateReaction(message.id, currentUser.id, '❤️')}
            className={cn(
              'px-3 py-2 rounded-2xl max-w-[70%] relative',
              isOwn ? 'bg-violet-700 text-white rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none',
            )}
          >
            {message.reply && (
              <div
                onClick={(e) => scrollToMessage?.(Number(e.currentTarget.id))}
                id={`${message.reply_id}`}
                className="bg-gray-900/50 border-l-2 border-violet-100 p-1 mb-1 text-xs text-gray-300 rounded-r-lg flex flex-col"
              >
                <span className="font-bold">{message.reply.username || 'User not found'}</span>
                <span>{message.reply.text || 'Original message deleted'}</span>
              </div>
            )}

            <p className="text-sm break-words leading-[20px]">{message?.text}</p>

            <div className="flex justify-between gap-2">
              <ReactionList message={message} updateReaction={updateReaction} />

              <div className="flex items-center justify-end gap-2 mt-1">
                {message.createdAt !== message.updatedAt && (
                  <p className="text-[10px] opacity-[0.7] leading-[8px]">edited</p>
                )}

                <Time date={message.updatedAt} />
                <div>{message.isPinned ? <Pin size={10} /> : ''}</div>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>

        <MessageMenu
          isOwn={isOwn}
          isPinned={message.isPinned}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onCopy={handleCopy}
          onReply={handleReply}
          onPin={togglePin}
        >
          <EmojiMenu
            pressedEmojis={userPressedEmojis(message, currentUser.id)}
            handleClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              const selectedEmoji = e.currentTarget.textContent;
              if (selectedEmoji) {
                updateReaction(message.id, currentUser.id, selectedEmoji);
              }
            }}
          />
        </MessageMenu>
      </ContextMenu>
    </div>
  );
};
