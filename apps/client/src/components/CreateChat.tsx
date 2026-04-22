import { useState } from 'react';
import { SquarePen } from 'lucide-react';
import { createChat } from '../services/chats';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const CreateChat = () => {
  const [memberId, setMemberId] = useState<number | string>('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (userId: number) => createChat(userId),
    onSuccess: () => {
      setMemberId('');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const handleCreate = () => {
    const id = Number(memberId);
    if (!isNaN(id) && id > 0) {
      mutate(id);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
      <input
        type="number"
        placeholder="Enter userId"
        value={memberId}
        disabled={isPending}
        className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
        onChange={(e) => setMemberId(e.target.value)}
      />
      <button
        onClick={handleCreate}
        disabled={isPending || !memberId}
        className="text-gray-400 hover:text-violet-500 disabled:opacity-50 transition-colors"
      >
        <SquarePen size={22} className={isPending ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
};
