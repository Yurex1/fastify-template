import { setLastChatId } from '../utils/lastOpenChatId';
import { CreateChat } from './CreateChat';

import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmptyBlock } from './EmptyBlock';
import { useChats } from '../hooks/useChats';

import { ChatBlock } from './ChatBlock';

interface ChatListProps {
  currentChatId: number | null;
  setCurrentChatId: (id: number) => void;
}

const ChatList = ({ currentChatId, setCurrentChatId }: ChatListProps) => {
  const query = useChats();
  const { sentinelRef } = useIntersectionObserver({
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    rootMargin: '300px',
  });

  const handleChangeChatId = (chatId: number) => {
    setCurrentChatId(chatId);
    setLastChatId(chatId);
  };

  const chats = query.data?.pages.flat() || [];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Chats</h2>

      <CreateChat />

      <div className="flex-1 w-full overflow-y-auto p-2">
        {chats.map((chat) => (
          <ChatBlock chat={chat} currentChatId={currentChatId} handleChangeChatId={handleChangeChatId} />
        ))}
        <div ref={sentinelRef} className="h-1 w-full" />

        {query.isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 text-xs italic">Loading old messages...</div>
        )}

        {query.isLoading && <div className="text-center py-2 text-gray-500 text-xs">Loading...</div>}
        {!query.isLoading && chats.length === 0 && <EmptyBlock />}
      </div>
    </div>
  );
};

export default ChatList;
