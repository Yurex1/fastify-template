import { lazy, useEffect, useRef, Suspense, useState } from 'react';
import { Loader } from '../Loader';
import MessageForm from './MessageForm';
import { EmptyBlock } from '../EmptyBlock';
import { LucideSearch, PhoneCall, X } from 'lucide-react';
import { useMessageForm } from '../../hooks/useMessageForm';
import { ReplyBlock } from '../ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import useChatUIStore from '../../stores/chatUI';
import { ScrollToBottom } from '../ScrollToBottom';
import useMessageFormStore from '../../stores/messageForm';
import TypingBlock from '../TypingBlock';
import { Virtuoso, type VirtuosoHandle, type ListItem } from 'react-virtuoso';
import { useMessageList } from '../../hooks/useMessageList';
import { useChatSocket } from '../../websocket/ChatSocketContext';
import type { Message } from '../../api/chats/types';
import { CallRoom } from '../CallRoom';

const ANCHOR_READY_FALLBACK_MS = 300;
const CHAT_SCROLL_WINDOW_MS = 500;

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));

const MessageWindow = () => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const incomingCall = useChatUIStore((s) => s.incomingCall);
  const setIsIncomingCall = useChatUIStore((s) => s.setIsIncomingCall);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);
  const isAtBottom = useChatUIStore((s) => s.isAtBottom);
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const setPinnedMode = useChatUIStore((s) => s.setPinnedMode);
  const virtuosoKey = anchorMessageId !== null ? `anchor-${anchorMessageId}` : 'default';
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const isListReady = anchorMessageId === null || readyKey === virtuosoKey;
  const anchorReadyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatScrollActiveRef = useRef(false);

  const { deleteMessage, updateMessage, updateReaction, sendMessage, typing, createRoom } = useChatSocket();

  const [callmode, setCallmode] = useState(false);

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
    if (anchorMessageId !== null) return;
    chatScrollActiveRef.current = true;
    const timer = setTimeout(() => {
      chatScrollActiveRef.current = false;
    }, CHAT_SCROLL_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [currentChatId]);

  useEffect(() => {
    return () => {
      if (anchorReadyRef.current) {
        clearTimeout(anchorReadyRef.current);
        anchorReadyRef.current = null;
      }
    };
  }, [virtuosoKey]);

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

  const stickToBottomOnChatSwitch = (items: ListItem<Message>[]) => {
    if (!chatScrollActiveRef.current || items.length <= 1) return;
    virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end', behavior: 'auto' });
  };

  const revealAfterAnchorReady = (items: ListItem<Message>[]) => {
    if (isListReady || items.length === 0) return;

    if (items.length === 1) {
      if (anchorReadyRef.current) return;
      anchorReadyRef.current = setTimeout(() => {
        anchorReadyRef.current = null;
        setReadyKey(virtuosoKey);
      }, ANCHOR_READY_FALLBACK_MS);
      return;
    }

    if (anchorReadyRef.current) {
      clearTimeout(anchorReadyRef.current);
      anchorReadyRef.current = null;
    }

    if (anchorMessageId !== null) {
      const anchorIdx = messages.findIndex((m) => m.id === anchorMessageId);
      if (anchorIdx !== -1) {
        virtuosoRef.current?.scrollToIndex({ index: anchorIdx, align: 'center', behavior: 'auto' });
      }
    }

    requestAnimationFrame(() => setReadyKey(virtuosoKey));
  };

  const handleItemsRendered = (items: ListItem<Message>[]) => {
    stickToBottomOnChatSwitch(items);
    revealAfterAnchorReady(items);
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

    if (callmode) {
      return <CallRoom roomName={`chat-${currentChatId}`} />;
    }

    if (incomingCall.chatId && incomingCall.roomName) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          <div className="bg-gray-900 p-6 rounded-xl flex flex-col gap-4 items-center">
            <p className="text-white text-lg">Incoming call...</p>
            <div className="flex gap-3">
              <button
                className="bg-green-500 px-6 py-2 rounded-lg text-white"
                onClick={() => {
                  setCallmode(true);
                  setIsIncomingCall(null, null);
                }}
              >
                Accept
              </button>
              <button
                className="bg-red-500 px-6 py-2 rounded-lg text-white"
                onClick={() => setIsIncomingCall(null, null)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (callmode) {
      const roomName = incomingCall.roomName ?? `chat-${currentChatId}`;
      return <CallRoom roomName={roomName} />;
    }

    if (!isLoading && messages.length <= 0) {
      return <EmptyBlock />;
    }

    const showLoader = isLoading || (anchorMessageId !== null && !isListReady);
    return (
      <div className="relative flex-1 min-h-0 pb-3">
        {!isLoading && messages.length > 0 && (
          <Virtuoso
            key={virtuosoKey}
            style={{ visibility: isListReady ? 'visible' : 'hidden' }}
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
            itemsRendered={handleItemsRendered}
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
        )}

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <Loader />
          </div>
        )}

        {isListReady && (!isAtBottom || anchorMessageId !== null) && <ScrollToBottom onClick={scrollToBottom} />}
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

      <button
        className="self-end p-2"
        onClick={() => {
          if (currentChatId) {
            setCallmode(true);
            createRoom(currentChatId, `chat-${currentChatId}`);
          }
        }}
        aria-label={formMode === 'search' ? 'Close search' : 'Search messages'}
      >
        <PhoneCall />
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
