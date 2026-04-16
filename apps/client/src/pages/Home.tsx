import { useState } from "react";
import ChatList from "../components/ChatList";
import MessageWindow from "../components/MessageWindow";

export default function HomePage() {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  return (
    <div className="flex w-full">
      <ChatList
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
      />
      <MessageWindow currentChatId={currentChatId} />
    </div>
  );
}
