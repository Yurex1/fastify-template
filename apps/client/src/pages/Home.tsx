import { CallRoom } from '../components/CallRoom';
import ChatList from '../components/message/ChatList';
import MessageWindow from '../components/message/MessageWindow';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { useCall } from '../hooks/useCall';
import { useAuthStore } from '../stores/auth';
import useChatUIStore from '../stores/chatUI';

export default function HomePage() {
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const { incomingCall, activeCall, isInCall, acceptCall, declineCall } = useCall(currentChatId);

  if (isInCall) {
    return <CallRoom roomName={activeCall?.roomName!} />;
  }
  if (incomingCall) {
    return (
      <div className="w-full h-screen flex-1 flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 p-6 rounded-xl flex flex-col gap-4 items-center">
          <p className="text-white text-lg">{`Incoming ${activeCall?.type} call...`}</p>
          <p>by {incomingCall.chatName}</p>
          <div className="flex gap-3">
            <button className="bg-green-500 px-6 py-2 rounded-lg text-white" onClick={acceptCall}>
              Accept
            </button>
            <button className="bg-red-500 px-6 py-2 rounded-lg text-white" onClick={declineCall}>
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <ResizablePanelGroup orientation="horizontal" className="max-w-full rounded-lg border md:min-w-[450px]">
      <ResizablePanel defaultSize="25%" maxSize="25%">
        <div className="flex h-screen items-center justify-center">
          <button
            onClick={() => {
              useAuthStore.getState().logout();
            }}
            className="absolute top-0 z-[999]"
          >
            sign out
          </button>
          <ChatList />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center">
          <MessageWindow />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
