import { useEffect, useState } from "react";
import chatsApi from "../api/chats/chats";
import type { Chat } from "../api/auth/types";

const ChatList = ({
  currentChatId,
  setCurrentChatId,
}: {
  currentChatId: number | null;
  setCurrentChatId: (id: number) => void;
}) => {
  // const { chats, fetchChats, setCurrentChat, currentChatId } = useChatStore();

  const [chats, setChats] = useState<Chat[]>([]);
  async function fetchChats() {
    // set({ isLoading: true });
    try {
      const response = (await chatsApi.getChatList()) as Chat[];
      setChats(response);
    } catch (error) {
      console.error("Failed to fetch chats", error);
      setChats([]);
    }
  }
  // finally {
  //   set({ isLoading: false });
  // }

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="w-1/3 border-r border-gray-800 bg-black h-screen overflow-y-auto">
      <h2 className="p-4 text-xl font-bold text-white border-b border-gray-800">
        Чати
      </h2>

      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => setCurrentChatId(chat.id)}
          className={`p-4 cursor-pointer hover:bg-gray-900 ${currentChatId === chat.id ? "bg-gray-800" : ""}`}
        >
          <p className="text-gray-300">Чат #{chat.id}</p>
          {/* <small className="text-gray-500">
            {new Date(chat.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small> */}
        </div>
      ))}
    </div>
  );
};

export default ChatList;
