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
      <VideoConference
        className="
          bg-[#0f0f0f] 
          h-full 
          [&_.lk-control-bar]:bg-[#1c1c1e]/95 
          [&_.lk-control-bar]:border-t 
          [&_.lk-control-bar]:border-[#333337]
          [&_.lk-control-bar]:py-4
          
      
          [&_.lk-button]:rounded-full 
          [&_.lk-button]:bg-[#ffffff0d] 
          [&_.lk-button]:hover:bg-[#ffffff1a]
          [&_.lk-button]:transition-all 
          [&_.lk-button]:duration-200
          [&_.lk-button]:active:scale-95
          
          [&_.lk-button[aria-label*='Leave']]:!bg-red-600 
          [&_.lk-button[aria-label*='Leave']]:hover:!bg-red-500
          
          [&_.lk-participant-tile]:rounded-2xl 
          [&_.lk-participant-tile]:overflow-hidden 
          [&_.lk-participant-tile]:border 
          [&_.lk-participant-tile]:border-white/10
          [&_.lk-participant-tile]:hover:border-[#2481cc]/40
          
          [&_.lk-participant-name]:bg-black/60 
          [&_.lk-participant-name]:px-4 
          [&_.lk-participant-name]:py-1 
          [&_.lk-participant-name]:rounded-full 
          [&_.lk-participant-name]:text-sm
          [&_.lk-participant-name]:bottom-3 
          [&_.lk-participant-name]:left-3
        "
      />
    </LiveKitRoom>
  );
}
