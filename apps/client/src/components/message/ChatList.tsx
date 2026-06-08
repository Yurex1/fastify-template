import { setLastChatId } from '../../utils/lastOpenChatId';
import { CreateChat } from '../CreateChat';
import { EmptyBlock } from '../EmptyBlock';
import { useChats } from '../../hooks/useChats';

import { ChatBlock } from './ChatBlock';
import useChatUIStore from '../../stores/chatUI';
import { Loader } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import type { Chat } from '../../api/chats/types';
import { SwitchLangBtn } from '../SwitchLang';
import { useTranslation } from 'react-i18next';

const ChatList = () => {
  const { chats, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } = useChats();
  const setCurrentChatId = useChatUIStore((s) => s.setCurrentChatId);
  const setCurrentChatInfo = useChatUIStore((s) => s.setCurrentChatInfo);
  const { t } = useTranslation();

  const handleChangeChatId = (chat: Chat | null) => {
    setCurrentChatId(chat?.id || null);
    setCurrentChatInfo(chat);
    setLastChatId(chat?.id || null);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">{t('chat.chats')}</h2>

      <CreateChat />
      <SwitchLangBtn />

      <div className="flex-1 w-full overflow-y-auto p-2">
        {chats.length > 0 && (
          <Virtuoso
            className="h-full"
            data={chats}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage && !isLoading) {
                fetchNextPage();
              }
            }}
            followOutput="smooth"
            itemContent={(_, chat) => <ChatBlock chat={chat} handleChangeChatId={() => handleChangeChatId(chat)} />}
            components={{
              Header: () => (isFetchingNextPage ? <Loader /> : null),
            }}
          />
        )}
        {!isLoading && chats.length === 0 && <EmptyBlock text="No chats yet" />}
      </div>
    </div>
  );
};

export default ChatList;
