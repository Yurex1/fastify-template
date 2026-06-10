import type { Message } from '../api/chats/types';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/auth';

interface ReactionListProps {
  message: Message;
  updateReaction: (id: number, userId: number, reaction: string) => void;
}

export const ReactionList = ({ message, updateReaction }: ReactionListProps) => {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser || !message.reactions || Object.keys(message.reactions).length === 0) {
    return null;
  }

  const result = Object.entries(message.reactions) as [string, number[]][];

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {result.map(([emoji, userIds]) => {
        const count = userIds.length;
        const isSelected = userIds.includes(currentUser.id);

        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              updateReaction(message.id, currentUser.id, emoji);
            }}
            key={emoji}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs cursor-pointer transition select-none',
              isSelected
                ? 'bg-blue-700 border border-violet-400 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300',
            )}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </div>
        );
      })}
    </div>
  );
};
