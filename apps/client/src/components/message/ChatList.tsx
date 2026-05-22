import { setLastChatId } from '../../utils/lastOpenChatId';
import { CreateChat } from '../CreateChat';
import { EmptyBlock } from '../EmptyBlock';
import { useChats } from '../../hooks/useChats';

import { ChatBlock } from './ChatBlock';
import useChatUIStore from '../../stores/chatUI';
import { Loader } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

const ChatList = () => {
  const { chats, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } = useChats();
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const setCurrentChatId = useChatUIStore((s) => s.setCurrentChatId);

  const handleChangeChatId = (chatId: number | null) => {
    setCurrentChatId(chatId);
    setLastChatId(chatId);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Chats</h2>

      <CreateChat />

      <div className="flex-1 w-full overflow-y-auto p-2">
        <Virtuoso
          className="h-full"
          data={chats}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage && !isLoading) {
              fetchNextPage();
            }
          }}
          followOutput="smooth"
          itemContent={(_, chat) => (
            <ChatBlock
              key={chat.id}
              chat={chat}
              currentChatId={currentChatId}
              handleChangeChatId={handleChangeChatId}
            />
          )}
          components={{
            Header: () => (isFetchingNextPage ? <Loader /> : null),
            Footer: () => <p>end</p>,
          }}
        />
        {!isLoading && chats.length === 0 && <EmptyBlock />}
      </div>
    </div>
  );
};

export default ChatList;
