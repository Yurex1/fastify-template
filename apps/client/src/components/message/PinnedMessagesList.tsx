import { Virtuoso } from 'react-virtuoso';
import { usePinnedMessages } from '../../hooks/usePinnedMessages';
import { MessageBlock } from './MessageBlock';
import { Loader } from 'lucide-react';
import { EmptyBlock } from '../EmptyBlock';

const PinnedMessagesList = () => {
  const { pinnedMessages, isFetchingNextPage, isLoading, hasNextPage, fetchNextPage } = usePinnedMessages();

  return (
    <div className="flex-1 w-full overflow-y-auto p-2">
      <Virtuoso
        className="h-full"
        data={pinnedMessages}
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
          }
        }}
        initialTopMostItemIndex={pinnedMessages.length - 1}
        followOutput="smooth"
        itemContent={(_, pinnedMessage) => (
          <MessageBlock key={pinnedMessage.message.id} message={{ ...pinnedMessage.message, isPinned: true }} />
        )}
        components={{
          Header: () => (isFetchingNextPage ? <Loader /> : null),
        }}
      />
      {!isLoading && pinnedMessages.length === 0 && <EmptyBlock />}
    </div>
  );
};

export default PinnedMessagesList;
