import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { EmojiMenu } from '../EmojiMenu';
import { ReactionList } from '../ReactionList';

import Time from '../Time';
import MessageMenu from '../ContextMenu';
import { ContextMenu, ContextMenuTrigger } from '../ui/context-menu';
import { useAuthStore } from '../../stores/auth';
import { Pin } from 'lucide-react';
import chatsApi from '../../api/chats/chats';
import { isOwnMessage } from '../../utils/isOwnMessage';
import { useMessageActions } from '../../hooks/useMessageActions';
import useChatUIStore from '../../stores/chatUI';
import type { Message } from '../../api/chats/types';
import { useChatSocket } from '../../websocket/ChatSocketContext';
import { userPressedEmojis } from '../../utils/pressedEmoji';

interface MessageBlockProps {
  message: Message;
  scrollToMessage?: (id: number) => void;
}

export const MessageBlock = ({ message, scrollToMessage }: MessageBlockProps) => {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const highlightedMessageId = useChatUIStore((s) => s.highlightedMessageId);
  const isHighlighted = highlightedMessageId === message.id;
  const { updateReaction, deleteMessage } = useChatSocket();
  const setMenuForMessage = useChatUIStore((s) => s.setMenuForMessage);

  const { handleEdit, handleCopy, handleReply, handleDelete } = useMessageActions({
    deleteMessage,
  });

  if (!currentUser) return null;
  const isOwn = isOwnMessage(message.userId, currentUser.id);

  const togglePin = () => {
    if (message.isPinned) chatsApi.unpinMessage(message.chatId, message.id);
    else chatsApi.pinMessage(message.chatId, message.id);
  };

  if (!message) return null;

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'flex mb-1 whitespace-pre-wrap break-words px-4 transition-all duration-300',
        isOwn ? 'justify-end' : 'justify-start',
        isHighlighted && 'bg-gray-800',
      )}
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
                className="bg-gray-900/50 border-l-2 border-violet-100 p-1 mb-1 text-xs text-gray-300 rounded-r-lg flex flex-col min-w-0 max-w-full overflow-hidden cursor-pointer"
              >
                <span className="font-bold truncate">{message.reply.username || t('messageBlock.userNotFound')}</span>
                <span className="truncate">{message.reply.text || t('messageBlock.messageDeleted')}</span>
              </div>
            )}

            <p className="text-sm break-words leading-[20px]">{message?.text}</p>

            <div className="flex justify-between gap-2">
              <ReactionList message={message} updateReaction={updateReaction} />

              <div className="flex items-center justify-end gap-2 mt-1">
                {message.createdAt !== message.updatedAt && (
                  <p className="text-[10px] opacity-[0.7] leading-[8px]">{t('messageBlock.edited')}</p>
                )}

                <Time date={message.createdAt} />
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
