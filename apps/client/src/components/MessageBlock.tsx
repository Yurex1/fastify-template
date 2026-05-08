import type { Message } from '../api/types';
import { cn } from '../lib/utils';
import { EmojiMenu } from './EmojiMenu';
import { ReactionList, userPressedEmojis } from './ReactionList';
import Time from './Time';
import MessageMenu from './ContextMenu';
import { ContextMenu, ContextMenuTrigger } from './ui/context-menu';
import { useAuthStore } from '../stores/auth';
import { Pin } from 'lucide-react';
import chatsApi from '../api/chats/chats';
import { isOwnMessage } from '../utils/isOwnMessage';
import useUserStore from '../stores/user';
import { useMessageActions } from '../hooks/useMessageActions';

interface MessageBlockProps {
  message: Message;
  messages: Message[];
  updateReaction: (id: number, userId: number, reaction: string) => void;
  deleteMessage: (id: number) => void;
}

export const MessageBlock = ({ message, messages, updateReaction, deleteMessage }: MessageBlockProps) => {
  const currentUser = useAuthStore((state) => state.user);
  const setMenuForMessage = useUserStore((s) => s.setMenuForMessage);

  const { handleEdit, handleCopy, handleReply, handleDelete } = useMessageActions({
    messages,
    deleteMessage,
  });

  const isOwn = isOwnMessage(message.userId, currentUser.id);

  const replyMessage = messages.find((mes) => mes.id === message.reply_id);
  function togglePin() {
    if (message.isPinned) chatsApi.unpinMessage(message.chatId, message.id);
    else chatsApi.pinMessage(message.chatId, message.id);
  }

  if (!message) return null;

  return (
    <div className={cn('flex mb-1 whitespace-pre-wrap break-words', isOwn ? 'justify-end' : 'justify-start')}>
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
            {message.reply_id && (
              <div
                onClick={(e) => console.log(e.currentTarget.id)}
                id={`${message.reply_id}`}
                className="bg-gray-900/50 border-l-2 border-violet-100 p-2 mb-1 text-xs text-gray-300 rounded-r-lg"
              >
                {replyMessage?.text || 'Original message deleted'}
              </div>
            )}
            <p className="text-sm break-words leading-[20px]">{message.text}</p>

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
