import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import { useChatMessages } from '../hooks/useChatMessages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LucideSearch } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { TypingBlock } from './TypingBlock';
import { ReplyBlock } from './ReplyBlock';
import PinnedMessagesList from './PinnedMessagesList';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import { useMessageActions } from '../hooks/useMessageActions';

interface MessageWindowProps {
  currentChatId: number | null;
}

const MessageWindow = ({ currentChatId }: MessageWindowProps) => {
  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useChatMessages({
    currentChatId: currentChatId!,
  });
  const { deleteMessage, updateMessage, updateReaction, sendMessage, typing } = useWebSocket({
    currentChatId: currentChatId!,
  });

  const { sentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px',
  });
  const messages = data?.pages.flat() || [];
  const { replyTo, text, setText, setReplyTo, setFormMode } = useMessageActions({ messages, deleteMessage });
  const [pinnedMode, setPinnedMode] = useState<boolean>(false);

  const { handleSend, formButton } = useMessageForm({
    messages,
    sendMessage,
    currentChatId,
    updateMessage,
    deleteMessage,
  });

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">Select chat</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen">
      <OpenPinnedMessages currentChatId={currentChatId} pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {pinnedMode && (
          <PinnedMessagesList
            messages={messages}
            currentChatId={currentChatId}
            updateReaction={updateReaction}
            handleDelete={deleteMessage}
          />
        )}

        <button className="fixed z-[999]" onClick={() => setFormMode('search')}>
          <LucideSearch />
        </button>
        {!pinnedMode &&
          messages.map((message) => (
            <MessageBlock
              key={message.id}
              message={message}
              messages={messages}
              updateReaction={updateReaction}
              deleteMessage={deleteMessage}
            />
          ))}

        <div ref={sentinelRef} className="h-1 w-full" />

        {isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 text-xs italic">Loading old messages...</div>
        )}

        {isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
        {!isLoading && messages.length === 0 && <EmptyBlock />}
      </div>

      {replyTo && <ReplyBlock message={replyTo} userName={replyTo.username} onClose={() => setReplyTo(null)} />}

      <TypingBlock />
      {!pinnedMode && (
        <MessageForm text={text} setText={setText} handleSend={handleSend} formButton={formButton} typing={typing} />
      )}
    </div>
  );
};

export default MessageWindow;
