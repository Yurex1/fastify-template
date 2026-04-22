import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import MessageMenu from './ContextMenu';
import { ContextMenu, ContextMenuTrigger } from './ui/context-menu';
import { toast } from 'react-toastify';
import type { Message, FormMode } from '../api/types';
import { useChatMessages } from '../hooks/useChatMessages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface MessageWindowProps {
  currentChatId: number | null;
}

const MessageWindow = ({ currentChatId }: MessageWindowProps) => {
  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useChatMessages({
    currentChatId,
  });
  const { deleteMessage, updateMessage, sendMessage } = useWebSocket({ currentChatId });
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px',
  });

  const [text, setText] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [menuForMessage, setMenuForMessage] = useState<Message | null>(null);

  const messages = data?.pages.flat() || [];

  const isOwnMessage = (message: Message) => message.userId === currentUser?.id;

  const handleEdit = () => {
    if (menuForMessage) {
      setFormMode('edit');
      setText(menuForMessage.text);
    }
  };

  const handleCopy = () => {
    if (menuForMessage?.text) {
      navigator.clipboard.writeText(menuForMessage.text);
      toast.success('Text copied');
    }
  };

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">Select chat</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex mb-1', isOwnMessage(message) ? 'justify-end' : 'justify-start')}>
            <ContextMenu>
              <ContextMenuTrigger
                onContextMenu={() => {
                  if (isOwnMessage(message)) setMenuForMessage(message);
                }}
                asChild
              >
                <div
                  className={cn(
                    'px-3 py-2 rounded-2xl max-w-[70%]',
                    isOwnMessage(message)
                      ? 'bg-violet-700 text-white rounded-tr-none'
                      : 'bg-gray-800 text-white rounded-tl-none',
                  )}
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
              </ContextMenuTrigger>
              <MessageMenu
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={() => menuForMessage && deleteMessage(menuForMessage.id)}
              />
            </ContextMenu>
          </div>
        ))}

        <div ref={sentinelRef} className="h-1 w-full" />

        {isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 text-xs italic">Loading old messages...</div>
        )}

        {isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
        {!isLoading && messages.length === 0 && <EmptyBlock />}
      </div>

      <MessageForm
        currentChatId={currentChatId}
        text={text}
        formMode={formMode}
        messageToEdit={menuForMessage}
        setText={setText}
        setFormMode={setFormMode}
        setMessageToEdit={setMenuForMessage}
        updateMessage={updateMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default MessageWindow;
