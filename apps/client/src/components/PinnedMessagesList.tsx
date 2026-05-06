import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmptyBlock } from './EmptyBlock';

import { usePinnedMessages } from '../hooks/usePinnedMessages';
import { MessageBlock } from './MessageBlock';
import type { Message } from '../api/types';
import type { SetStateAction } from 'react';

interface PinnedMessagesListProps {
  currentChatId: number | null;
  messages: Message[];
  menuForMessage: Message;
  setMenuForMessage: React.Dispatch<SetStateAction<Message>>;
  updateReaction: (id: number, userId: number, reaction: string) => void;
  handleEdit: () => void;
  handleCopy: () => void;
  handleDelete: () => void;
  handleReply: () => void;
}

const PinnedMessagesList = ({
  currentChatId,
  messages,
  menuForMessage,
  setMenuForMessage,
  updateReaction,
  handleEdit,
  handleCopy,
  handleDelete,
  handleReply,
}: PinnedMessagesListProps) => {
  const query = usePinnedMessages({ currentChatId });

  const { sentinelRef } = useIntersectionObserver({
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    rootMargin: '300px',
  });

  const pinnedMessages = query.data?.pages.flat() || [];

  return (
    <div>
      <div ref={sentinelRef} className="h-1 w-full" />

      {pinnedMessages.map((message) => (
        <MessageBlock
          key={message.message_id}
          message={{
            ...message.message,
            isPinned: true,
          }}
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

      {query.isFetchingNextPage && <div className="text-center py-2 text-gray-500 text-xs italic">Loading more...</div>}

      {query.isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}

      {!query.isLoading && pinnedMessages.length === 0 && <EmptyBlock />}
    </div>
  );
};

export default PinnedMessagesList;
