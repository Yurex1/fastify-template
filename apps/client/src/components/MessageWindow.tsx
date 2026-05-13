import { useState, lazy, useEffect, Suspense } from 'react';
import { Loader } from './Loader';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import { useChatMessages } from '../hooks/useChatMessages';
import { LucideSearch, X } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { ReplyBlock } from './ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import useChatUIStore from '../stores/chatUI';
import { ScrollToBottom } from './ScrollToBottom';
import useMessageFormStore from '../stores/messageForm';
import { useScroll } from '../hooks/useScroll';

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));
const TypingBlock = lazy(() => import('./TypingBlock'));

const MessageWindow = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const setPinnedMode = useChatUIStore((s) => s.setPinnedMode);

  const [startPage, setStartPage] = useState(1);

  useEffect(() => {
    setPinnedMode(false);
  }, [currentChatId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setFormMode('search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const {
    data,
    messages,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
    clearAndReset,
  } = useChatMessages(startPage);
  const { deleteMessage, updateMessage, updateReaction, sendMessage, typing } = useWebSocket();

  const {
    scrollToMessage,
    bottomSentinelRef,
    topSentinelRef,
    isAtBottom,
    scrollContainerRef,
    bottomRef,
    setIsJumping,
  } = useScroll({
    fetchNextPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    messages,
    hasNextPage,
    hasPreviousPage,
    clearAndReset,
    isLoading,
    data,
    startPage,
    setStartPage,
  });

  const { formMode, replyTo, setFormMode, setText, setReplyTo } = useMessageFormStore();

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
      {formMode !== 'search' && <OpenPinnedMessages pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />}
      {pinnedMode && (
        <Suspense fallback={<Loader />}>
          <PinnedMessagesList updateReaction={updateReaction} handleDelete={deleteMessage} />
        </Suspense>
      )}
      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-2 text-gray-500 text-xs">
          <Loader />
        </div>
      )}

      {!pinnedMode && (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
          <div ref={bottomSentinelRef} className="h-1 w-full" />
          <div ref={bottomRef} className="h-px w-full" />

          <button
            className="fixed z-[999]"
            onClick={() => {
              setFormMode(formMode === 'search' ? 'create' : 'search');
              setText('');
            }}
          >
            {formMode === 'search' ? <X /> : <LucideSearch />}
          </button>

          {(!isAtBottom || startPage > 1) && (
            <ScrollToBottom
              targetRef={bottomRef}
              onClick={() => {
                if (startPage > 1) {
                  clearAndReset(currentChatId);
                  setStartPage(1);
                  setIsJumping(false);
                }
              }}
            />
          )}

          {messages.map((message) => (
            <MessageBlock
              key={message.id}
              message={message}
              updateReaction={updateReaction}
              deleteMessage={deleteMessage}
              scrollToMessage={scrollToMessage}
            />
          ))}
          <div ref={topSentinelRef} className="h-1 w-full" />
          {!isLoading && messages.length === 0 && <EmptyBlock />}
        </div>
      )}

      {replyTo && <ReplyBlock message={replyTo} userName={replyTo.username} onClose={() => setReplyTo(null)} />}

      <TypingBlock />
      {!pinnedMode && (
        <MessageForm
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
