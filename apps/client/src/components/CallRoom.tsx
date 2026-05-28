import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import chatsApi from '../api/chats/chats';

export function CallRoom({ roomName }: { roomName: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([chatsApi.getRoom(roomName), chatsApi.getTokenCall(roomName)])
      .then(([, tokenRes]) => setToken(tokenRes.token))
      .catch(() => setError('Failed to join call'));
  }, [roomName]);

  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>;
  if (!token) return <div className="flex-1 flex items-center justify-center text-gray-400">Connecting...</div>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      video={true}
      audio={true}
      onDisconnected={() => console.log('disconnected')}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
