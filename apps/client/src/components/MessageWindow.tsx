import { useState, lazy, useRef, useEffect } from 'react';
import { Loader } from './Loader';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import { useChatMessages } from '../hooks/useChatMessages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LucideSearch, X } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { ReplyBlock } from './ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import { useMessageActions } from '../hooks/useMessageActions';
import useChatUIStore from '../stores/chatUI';
import { ScrollToBottom } from './ScrollToBottom';
import useMessageFormStore from '../stores/messageForm';
import chatsApi from '../api/chats/chats';

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));
const TypingBlock = lazy(() => import('./TypingBlock'));

const MessageWindow = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [startPage, setStartPage] = useState(1);
  const [pendingScrollId, setPendingScrollId] = useState<number | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setStartPage(1);
    setPendingScrollId(null);
    setIsJumping(false);
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
  const { sentinelRef: topSentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px',
  });

  const { sentinelRef: bottomSentinelRef } = useIntersectionObserver({
    hasNextPage: hasPreviousPage && !isJumping,
    isFetchingNextPage: isFetchingPreviousPage,
    fetchNextPage: fetchPreviousPage,
    rootMargin: '0px',
  });

  // const messages = data?.pages.flat() || [];

  const { highlightMessage } = useMessageActions({
    deleteMessage,
  });

  const scrollToMessage = async (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      highlightMessage(el);
      return;
    }

    try {
      const { page } = await chatsApi.getMessagePage(currentChatId, messageId);
      setIsJumping(true);
      clearAndReset(currentChatId);
      setPendingScrollId(messageId);
      setStartPage(page);
    } catch (err) {
      console.error(err);
      setIsJumping(false);
    }
  };

  useEffect(() => {
    if (!pendingScrollId || isLoading) return;

    const tryScroll = (): boolean => {
      const el = document.getElementById(`message-${pendingScrollId}`);
      if (!el) return false;

      highlightMessage(el);
      setPendingScrollId(null);

      setTimeout(() => setIsJumping(false), 400);
      return true;
    };

    if (!tryScroll()) {
      requestAnimationFrame(() => {
        if (!tryScroll()) {
          setTimeout(() => {
            tryScroll();
            setIsJumping(false);
          }, 400);
        }
      });
    }
  }, [pendingScrollId, isLoading, data]);

  const { formMode, replyTo, setFormMode, setText, setReplyTo } = useMessageFormStore();

  const [pinnedMode, setPinnedMode] = useState<boolean>(false);

  const { handleSend, formButton } = useMessageForm({
    sendMessage,
    updateMessage,
    deleteMessage,
  });

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">Select chat</div>;
  }
  if (pinnedMode) {
    return <PinnedMessagesList updateReaction={updateReaction} handleDelete={deleteMessage} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen">
      {formMode !== 'search' && <OpenPinnedMessages pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />}

      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-2 text-gray-500 text-xs">
          <Loader />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {!isJumping && !isFetchingPreviousPage && hasPreviousPage && (
          <div ref={bottomSentinelRef} className="h-1 w-full" />
        )}
        <div ref={bottomRef} className="h-px w-full" />
        {pinnedMode && <PinnedMessagesList updateReaction={updateReaction} handleDelete={deleteMessage} />}
        <div ref={bottomRef} className="h-1 w-full" />

        {!pinnedMode && (
          <button
            className="fixed z-[999]"
            onClick={() => {
              setFormMode(formMode === 'search' ? 'create' : 'search');
              setText('');
            }}
          >
            {formMode === 'search' ? <X /> : <LucideSearch />}
          </button>
        )}

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
        <div ref={topSentinelRef} className="h-1 w-full" />
        {!isLoading && messages.length === 0 && <EmptyBlock />}
      </div>

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
