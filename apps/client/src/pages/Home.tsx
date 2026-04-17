import { useState } from 'react';
import MessageWindow from '../components/MessageWindow';
import { getLastChatId } from '../utils/lastOpenChatId';
import ChatList from '../components/ChatList';

export default function HomePage() {
  const lastChatId = getLastChatId();
  const [collapsed, setCollapsed] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(lastChatId);
  return (
    <div className="flex w-full min-h-screen bg-white dark:bg-[#1f1f1f] transition-colors duration-300 overflow-hidden">
      <ChatList
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 h-[100dvh] overflow-x-hidden text-black dark:text-white">
        <MessageWindow currentChatId={currentChatId} />
      </main>
    </div>
  );
}
