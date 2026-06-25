import { lazy, useEffect, useRef, Suspense } from 'react';
import { Loader } from '../Loader';
import { useTranslation } from 'react-i18next';
import MessageForm from './MessageForm';
import { EmptyBlock } from '../EmptyBlock';
import { useMessageForm } from '../../hooks/useMessageForm';
import { ReplyBlock } from '../ReplyBlock';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';
import useChatUIStore from '../../stores/chatUI';
import { ScrollToBottom } from '../ScrollToBottom';
import useMessageFormStore from '../../stores/messageForm';
import TypingBlock from '../TypingBlock';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useMessageList } from '../../hooks/useMessageList';
import { UserInfo } from './UserInfo';
import { useNotifications } from '../../hooks/useNotifications';

const PinnedMessagesList = lazy(() => import('./PinnedMessagesList'));

const MessageWindow = () => {
  const { t } = useTranslation();

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const currentChatInfo = useChatUIStore((s) => s.currentChatInfo);

  const isAtBottom = useChatUIStore((s) => s.isAtBottom);
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const setPinnedMode = useChatUIStore((s) => s.setPinnedMode);

  const {
    messages,
    firstItemIndex,
    initialTopMostItemIndex,
    startReached,
    endReached,
    atBottomStateChange,
    scrollToMessage,
    returnToLive,
    isListReady,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  } = useMessageList(virtuosoRef);
  const { toggleNotifications, notificationsEnabled } = useNotifications({ scrollToMessage });

  const { formMode, replyTo, setFormMode, setReplyTo } = useMessageFormStore();
  const { formButton, resultCounter, results, navigateResult, textareaRef, handleOnChange, handleKeyDown } =
    useMessageForm({
      scrollToMessage,
    });

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

  const renderContent = () => {
    if (!currentChatId) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 h-full">
          {t('messageWindow.selectChat')}
        </div>
      );
    }

    if (pinnedMode) {
      return (
        <Suspense fallback={<Loader />}>
          <PinnedMessagesList scrollToMessage={scrollToMessage} />
        </Suspense>
      );
    }

    if (!isLoading && messages.length === 0 && anchorMessageId === null && isListReady) {
      return <EmptyBlock text={t('messageWindow.noMessages')} />;
    }

    const showLoader = !isListReady || (messages.length === 0 && (isLoading || anchorMessageId !== null));

    return (
      <div className="relative flex-1 min-h-0 pb-3">
        {messages.length > 0 && (
          <Virtuoso
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
            itemContent={(_, message) => (
              <MessageBlock key={message.id} message={message} scrollToMessage={scrollToMessage} />
            )}
            components={{
              Header: () =>
                isFetchingNextPage ? (
                  <Loader />
                ) : (
                  <p className="text-center text-xs text-gray-500 m-2">{t('messageWindow.noMoreResults')}</p>
                ),
              Footer: () => (isFetchingPreviousPage ? <Loader /> : null),
            }}
          />
        )}

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <Loader />
          </div>
        )}

        {isListReady && messages.length > 0 && (!isAtBottom || anchorMessageId !== null) && (
          <ScrollToBottom onClick={returnToLive} />
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen overflow-hidden">
      {formMode !== 'search' && currentChatId && currentChatInfo && <UserInfo />}
      {formMode !== 'search' && <OpenPinnedMessages pinnedMode={pinnedMode} setPinnedMode={setPinnedMode} />}

      {renderContent()}

      {replyTo && <ReplyBlock message={replyTo} userName={replyTo.username} onClose={() => setReplyTo(null)} />}

      <TypingBlock />
      <button
        aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
        onClick={toggleNotifications}
      >
        {notificationsEnabled ? t('notifications.disable') : t('notifications.enable')}
      </button>

      {!pinnedMode && currentChatId && (
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
