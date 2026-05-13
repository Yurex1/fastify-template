import { LucideArrowLeftCircle, Pin } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, type SetStateAction } from 'react';
import useChatUIStore from '../stores/chatUI';
import { useLastPinnedMessage } from '../hooks/useLastPinnedMessage';

interface Props {
  pinnedMode: boolean;
  setPinnedMode: React.Dispatch<SetStateAction<boolean>>;
}

export const OpenPinnedMessages = ({ pinnedMode, setPinnedMode }: Props) => {
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  useEffect(() => {
    setPinnedMode(false);
  }, [currentChatId]);

  const { data } = useLastPinnedMessage();

  const count = data?.total_count;
  const pinned = data?.text;

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
        <span className="text-xs text-gray-400">{count > 1 ? `${count} messages` : `${count} message`}</span>
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

        <span className="text-sm text-white truncate">{pinned}</span>
      </div>
    </div>
  );
};
