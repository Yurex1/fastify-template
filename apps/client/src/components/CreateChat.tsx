import { useState } from 'react';
import chatsApi from '../api/chats/chats';
import type { Chat } from '../api/auth/types';
import { SquarePen } from 'lucide-react';

export const CreateChat = ({ setChats }: { setChats: React.Dispatch<React.SetStateAction<Chat[]>> }) => {
  const [memberId, setMemberId] = useState<number | null>(null);
  const [error, setError] = useState(null);
  async function createChat(memberId: number) {
    if (!memberId) return;
    try {
      const chat = (await chatsApi.createChat(memberId)) as Chat;
      setChats((prev) => [chat, ...prev]);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError('There is no user with this ID');
      }
      console.log(error);
    }
  }
  return (
    <>
      <div className="flex items-center gap-3 px-4">
        <input
          value={memberId}
          type="number"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-1 text-white focus:outline-none resize-none"
          onChange={(e) => setMemberId(Number(e.target.value))}
        />
        <button
          onClick={() => {
            createChat(memberId);
          }}
        >
          <SquarePen />
        </button>
      </div>
      {error && <div className="text-red-900 px-4">{error}</div>}
    </>
  );
};
