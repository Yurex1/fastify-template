import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { usePinnedMessages } from '../hooks/usePinnedMessages';
import { MessageBlock } from './MessageBlock';

interface PinnedMessagesListProps {
  updateReaction: (id: number, userId: number, reaction: string) => void;
  handleDelete: (id: number) => void;
}

const PinnedMessagesList = ({ updateReaction, handleDelete }: PinnedMessagesListProps) => {
  const query = usePinnedMessages();
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    rootMargin: '300px',
  });

  const pinnedMessages = query.data?.pages.flat() || [];

  return (
    <div className="flex-1 flex flex-col-reverse">
      <div ref={sentinelRef} className="h-1 w-full" />

      {pinnedMessages.map((message) => (
        <MessageBlock
          key={message.message.id}
          message={{
            ...message.message,
            isPinned: true,
          }}
          updateReaction={updateReaction}
          deleteMessage={handleDelete}
        />
      ))}

      {query.isFetchingNextPage && <div className="text-center py-2 text-gray-500 text-xs italic">Loading more...</div>}

      {query.isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
    </div>
  );
};

export default PinnedMessagesList;
