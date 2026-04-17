import { useEffect, useState } from 'react';
import chatsApi from '../api/chats/chats';
import type { Chat } from '../api/auth/types';
import { setLastChatId } from '../utils/lastOpenChatId';
import { CreateChat } from './CreateChat';
import { X, Menu } from 'lucide-react';

const ChatList = ({
  currentChatId,
  collapsed,
  setCollapsed,
  setCurrentChatId,
}: {
  currentChatId: number | null;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentChatId: (id: number) => void;
}) => {
  const [chats, setChats] = useState<Chat[]>([]);

  // async function handlePendingChats() {
  //   try {
  //     setChats([]);
  //     const res = (await chatsApi.getPendingChatList()) as Chat[];
  //     setChats(res);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async function fetchChats() {
    try {
      const response = (await chatsApi.getChatList()) as Chat[];
      setChats(response);
    } catch (error) {
      console.error('Failed to fetch chats', error);
      setChats([]);
    }
  }

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <>
      <button
        className={`absolute top-2 p-2 transition-all duration-350 ease-in-out ${collapsed ? 'left-0' : 'left-[16.5em]'}`}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? <Menu size={25} /> : <X size={25} />}
      </button>
      <div
        className={`w-1/4 border-r border-gray-800 bg-black h-screen
        transition-all duration-350 ease-in-out ${collapsed ? 'max-w-0' : 'max-w-[19em]'}`}
      >
        <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">Чати</h2>
        {/* <button onClick={handlePendingChats}>show pending chats</button> */}
        <CreateChat setChats={setChats} />

        <div
          className={`h-full w-full overflow-y-auto p-2 pb-30 transition-all duration-350 ease-in-out ${collapsed ? 'opacity-0 -translate-x-[200%]' : 'opacity-100 translate-x-0'}`}
        >
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setLastChatId(chat.id);
              }}
              className={`p-4 cursor-pointer ${currentChatId === chat.id ? 'bg-gray-700' : ''}`}
            >
              <p className="text-gray-300">{chat.member.username}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatList;
