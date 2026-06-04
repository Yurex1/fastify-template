import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import chatsApi from '../api/chats/chats';
import { useCall } from '../hooks/useCall';
import useChatUIStore from '../stores/chatUI';
import { useQuery } from '@tanstack/react-query';

export function CallRoom({ roomName }: { roomName: string }) {
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const { endCall, activeCall } = useCall(currentChatId);

  const { data, isError, error } = useQuery({
    queryKey: ['callToken', roomName],
    queryFn: () =>
      Promise.all([chatsApi.getRoom(roomName), chatsApi.getTokenCall(roomName)]).then(
        ([, tokenRes]: any) => tokenRes.token,
      ),
  });

  if (isError) return <div className="flex-1 flex items-center justify-center text-red-500">{error.message}</div>;
  if (!data) return <div className="flex-1 flex items-center justify-center text-gray-400">Підключення...</div>;

  return (
    <LiveKitRoom
      token={data}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      video={activeCall?.type === 'video'}
      audio={true}
      onDisconnected={endCall}
      className="bg-[#0f0f0f] h-full"
    >
      <VideoConference className="call-room bg-[#0f0f0f] h-full" />
    </LiveKitRoom>
  );
}
