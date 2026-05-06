import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageForm from './MessageForm';
import { EmptyBlock } from './EmptyBlock';
import { toast } from 'react-toastify';
import type { Message, FormMode } from '../api/types';
import { useChatMessages } from '../hooks/useChatMessages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { LucideSearch } from 'lucide-react';
import { useMessageForm } from '../hooks/useMessageForm';
import { TypingBlock } from './TypingBlock';
import { ReplyBlock } from './ReplyBlock';
import PinnedMessagesList from './PinnedMessagesList';
import { MessageBlock } from './MessageBlock';
import { OpenPinnedMessages } from './OpenPinnedMessages';

interface MessageWindowProps {
  currentChatId: number | null;
}

const MessageWindow = ({ currentChatId }: MessageWindowProps) => {
  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useChatMessages({
    currentChatId: currentChatId!,
  });
  const { deleteMessage, updateMessage, updateReaction, sendMessage } = useWebSocket({
    currentChatId: currentChatId!,
  });
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px',
  });

  const [text, setText] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [menuForMessage, setMenuForMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pinnedMode, setPinnedMode] = useState<boolean>(false);

  const messages = data?.pages.flat() || [];

  const handleSearch = () => {
    const mes = messages.filter((message) => message.text.includes(text));
    console.log(mes);
    // remove later
  };

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

  const handleReply = () => {
    if (menuForMessage) {
      setFormMode('reply');
      setReplyTo(menuForMessage);
    }
  };

  const handleDelete = () => {
    if (menuForMessage) {
      deleteMessage(menuForMessage.id);
    }
  };
  const { handleSend, formButton } = useMessageForm({
    formMode,
    setMessageToEdit: setMenuForMessage,
    setFormMode,
    setReplyTo,
    setText,
    text,
    sendMessage,
    currentChatId,
    handleSearch,
    messageToEdit: menuForMessage,
    updateMessage,
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
            menuForMessage={menuForMessage}
            setMenuForMessage={setMenuForMessage}
            updateReaction={updateReaction}
            handleEdit={handleEdit}
            handleCopy={handleCopy}
            handleDelete={handleDelete}
            handleReply={handleReply}
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
              menuForMessage={menuForMessage}
              setMenuForMessage={setMenuForMessage}
              updateReaction={updateReaction}
              handleEdit={handleEdit}
              handleCopy={handleCopy}
              handleDelete={handleDelete}
              handleReply={handleReply}
            />
          ))}

        <div ref={sentinelRef} className="h-1 w-full" />

        {isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 text-xs italic">Loading old messages...</div>
        )}

        {isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
        {!isLoading && messages.length === 0 && <EmptyBlock />}
      </div>

      {replyTo && <ReplyBlock message={replyTo} userName={'o'} onClose={() => setReplyTo(null)} />}

      <TypingBlock />
      <MessageForm text={text} setText={setText} handleSend={handleSend} formButton={formButton} />
    </div>
  );
};

export default MessageWindow;
