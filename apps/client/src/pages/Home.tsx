import { useState } from 'react';
import ChatList from '../components/ChatList';
import MessageWindow from '../components/MessageWindow';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { getLastChatId } from '../utils/lastOpenChatId';

export default function HomePage() {
  const lastChatId = getLastChatId();

  const [currentChatId, setCurrentChatId] = useState<number | null>(lastChatId);

  return (
    <ResizablePanelGroup orientation="horizontal" className="max-w-full rounded-lg border md:min-w-[450px]">
      <ResizablePanel defaultSize="25%" maxSize="25%">
        <div className="flex h-screen items-center justify-center">
          <ChatList currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center">
          <MessageWindow currentChatId={currentChatId} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
