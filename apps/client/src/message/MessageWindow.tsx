import { lazy, useEffect, Suspense, useRef, useState } from 'react';
import { Loader } from '../components/Loader';
import MessageForm from './MessageForm';
import { EmptyBlock } from '../components/EmptyBlock';
import { LucideSearch, X } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { ReplyBlock } from '../components/ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import useChatUIStore from '../stores/chatUI';
import { ScrollToBottom } from '../components/ScrollToBottom';
import useMessageFormStore from '../stores/messageForm';
import TypingBlock from '../components/TypingBlock';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useMessageList } from '../hooks/useMessageList';
import { useChatSocket } from '../websocket/ChatSocketContext';

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));

const MessageWindow = () => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);
  const isAtBottom = useChatUIStore((s) => s.isAtBottom);
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const setPinnedMode = useChatUIStore((s) => s.setPinnedMode);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const { deleteMessage, updateMessage, updateReaction, sendMessage, typing } = useChatSocket();

  const {
    messages,
    firstItemIndex,
    initialTopMostItemIndex,
    startReached,
    endReached,
    atBottomStateChange,
    scrollToMessage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  } = useMessageList(virtuosoRef);

  const { formMode, replyTo, setFormMode, setReplyTo } = useMessageFormStore();
  const {
    formButton,
    resultCounter,
    results,
    navigateResult,
    switchFormMode,
    textareaRef,
    handleOnChange,
    handleKeyDown,
  } = useMessageForm({
    sendMessage,
    updateMessage,
    deleteMessage,
    typing,
    scrollToMessage,
  });
  useEffect(() => {
    setIsLoadingList(false);
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
  }, [setFormMode]);

  const scrollToBottom = () => {
    if (anchorMessageId !== null) {
      setAnchorMessageId(null);
    } else {
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (!currentChatId) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">Select chat</div>
      );
    }

    if (pinnedMode) {
      return (
        <Suspense fallback={<Loader />}>
          <PinnedMessagesList updateReaction={updateReaction} handleDelete={deleteMessage} />
        </Suspense>
      );
    }

    if (!isLoading && messages.length <= 0) {
      return <EmptyBlock />;
    }

    return (
      <div className="relative flex-1 min-h-0 pb-3">
        {!isLoadingList && <p>ijijioljijoli</p>}

        <Virtuoso
          key={`${currentChatId}-${anchorMessageId ?? 'default'}`}
          ref={virtuosoRef}
          data={messages}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={initialTopMostItemIndex()}
          startReached={startReached}
          endReached={endReached}
          overscan={600}
          followOutput={anchorMessageId === null ? 'smooth' : false}
          atBottomStateChange={atBottomStateChange}
          increaseViewportBy={{ top: 300, bottom: 300 }}
          itemsRendered={() => {
            if (!isLoadingList) setIsLoadingList(true);
          }}
          itemContent={(_, message) => (
            <MessageBlock
              key={message.id}
              message={message}
              updateReaction={updateReaction}
              deleteMessage={deleteMessage}
              scrollToMessage={scrollToMessage}
            />
          )}
          components={{
            Header: () => (isFetchingNextPage ? <Loader /> : null),
            Footer: () => (isFetchingPreviousPage ? <Loader /> : null),
          }}
        />

        {(!isAtBottom || anchorMessageId !== null) && <ScrollToBottom onClick={scrollToBottom} />}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen">
      {formMode !== 'search' && <OpenPinnedMessages pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />}

      <button
        className="self-end p-2"
        onClick={() => switchFormMode(formMode === 'search' ? 'create' : 'search')}
        aria-label={formMode === 'search' ? 'Close search' : 'Search messages'}
      >
        {formMode === 'search' ? <X /> : <LucideSearch />}
      </button>

      {renderContent()}

      {replyTo && <ReplyBlock message={replyTo} userName={replyTo.username} onClose={() => setReplyTo(null)} />}

      <TypingBlock />

      {!pinnedMode && (
        <MessageForm
          resultCounter={resultCounter}
          results={results}
          navigateResult={navigateResult}
          textareaRef={textareaRef}
          handleOnChange={handleOnChange}
          handleKeyDown={handleKeyDown}
          formButton={formButton}
        />
      )}
    </div>
  );
};

export default MessageWindow;
