import { useState, lazy } from 'react';
import { Loader } from './Loader';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import { useChatMessages } from '../hooks/useChatMessages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LucideSearch } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { ReplyBlock } from './ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import { useMessageActions } from '../hooks/useMessageActions';
import useChatUIStore from '../stores/chatUI';

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));
const TypingBlock = lazy(() => import('./TypingBlock'));

const MessageWindow = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useChatMessages();
  const { deleteMessage, updateMessage, updateReaction, sendMessage, typing } = useWebSocket();
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px',
  });

  const messages = data?.pages.flat() || [];

  const { replyTo, text, formMode, isFetching, setText, setReplyTo, setFormMode, scrollToMessage } = useMessageActions({
    deleteMessage,
    fetchNextPage,
    loadedPages: data?.pages.length ?? 1,
  });
  const [pinnedMode, setPinnedMode] = useState<boolean>(false);

  const { handleSend, formButton } = useMessageForm({
    sendMessage,
    updateMessage,
    deleteMessage,
  });

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">Select chat</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen">
      <OpenPinnedMessages pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />

      {(isLoading || isFetchingNextPage || isFetching) && (
        <div className="text-center py-2 text-gray-500 text-xs">
          <Loader />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {pinnedMode && <PinnedMessagesList updateReaction={updateReaction} handleDelete={deleteMessage} />}

        <button className="fixed z-[999]" onClick={() => setFormMode('search')}>
          <LucideSearch />
        </button>

        {!pinnedMode &&
          messages.map((message) => (
            <MessageBlock
              key={message.id}
              message={message}
              updateReaction={updateReaction}
              deleteMessage={deleteMessage}
              scrollToMessage={scrollToMessage}
            />
          ))}

        <div ref={sentinelRef} className="h-1 w-full" />

        {!isLoading && messages.length === 0 && <EmptyBlock />}
      </div>

      {replyTo && <ReplyBlock message={replyTo} userName={replyTo.username} onClose={() => setReplyTo(null)} />}

      <TypingBlock />
      {!pinnedMode && (
        <MessageForm
          text={text}
          formMode={formMode}
          setText={setText}
          handleSend={handleSend}
          formButton={formButton}
          typing={typing}
          scrollToMessage={scrollToMessage}
        />
      )}
    </div>
  );
};

export default MessageWindow;
