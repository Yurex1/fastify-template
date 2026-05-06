import { LucideArrowLeftCircle, Pin } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePinnedMessages } from '../hooks/usePinnedMessages';
import type { SetStateAction } from 'react';

interface Props {
  currentChatId: number;
  pinnedMode: boolean;
  setPinnedMode: React.Dispatch<SetStateAction<boolean>>;
}

export const OpenPinnedMessages = ({ currentChatId, pinnedMode, setPinnedMode }: Props) => {
  const { data } = usePinnedMessages({ currentChatId });

  const allPinned = data?.pages.flat() || [];
  const count = allPinned.length;
  const pinned = allPinned[allPinned.length - 1];

  if (!pinned) return null;

  if (pinnedMode) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 cursor-pointer',
          'bg-gray-900/80 backdrop-blur border-b border-gray-800',
          'hover:bg-gray-800 transition',
        )}
      >
        <span className="text-xs text-gray-400">
          <LucideArrowLeftCircle onClick={() => setPinnedMode(false)} />
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => setPinnedMode(true)}
      className={cn(
        'flex items-center gap-3 px-4 py-2 cursor-pointer',
        'bg-gray-900/80 backdrop-blur border-b border-gray-800',
        'hover:bg-gray-800 transition',
      )}
    >
      <Pin size={16} className="text-violet-400 shrink-0" />

      <div className="flex flex-col overflow-hidden">
        <span className="text-xs text-gray-400">Pinned message{count > 1 ? `s (${count})` : ''}</span>

        <span className="text-sm text-white truncate">{pinned.message.text}</span>
      </div>
    </div>
  );
};
