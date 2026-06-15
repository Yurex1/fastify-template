import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';

import { usePinnedMessages } from '../../hooks/usePinnedMessages';
import { MessageBlock } from './MessageBlock';
import { Loader } from 'lucide-react';
import { EmptyBlock } from '../EmptyBlock';

const PinnedMessagesList = ({ scrollToMessage }: { scrollToMessage: (messageId: number) => void }) => {
  const { pinnedMessages, isFetchingNextPage, isLoading, hasNextPage, fetchNextPage } = usePinnedMessages();
  const { t } = useTranslation();

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
          <MessageBlock
            key={pinnedMessage.message.id}
            message={{ ...pinnedMessage.message, isPinned: true }}
            scrollToMessage={scrollToMessage}
          />
        )}
        components={{
          Header: () => (isFetchingNextPage ? <Loader /> : null),
        }}
      />
      {!isLoading && pinnedMessages.length === 0 && <EmptyBlock text={t('pinnedMessages.noPinned')} />}
    </div>
  );
};

export default PinnedMessagesList;
