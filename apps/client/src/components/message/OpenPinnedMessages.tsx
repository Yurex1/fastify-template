import { LucideArrowLeftCircle, Pin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';

import { usePinnedMessages } from '../../hooks/usePinnedMessages';
import useChatUIStore from '../../stores/chatUI';

interface OpenPinnedMessagesProps {
  pinnedMode: boolean;
  setPinnedMode: (val: boolean) => void;
}

export const OpenPinnedMessages = ({ pinnedMode, setPinnedMode }: OpenPinnedMessagesProps) => {
  const { data } = usePinnedMessages();
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const count = data?.pages?.[0]?.totalCount ?? 0;
  const pinned = data?.pages?.[0]?.data?.[0]?.message?.text;

  useEffect(() => {
    setPinnedMode(false);
  }, [currentChatId, setPinnedMode]);

  if (!pinned) return null;

  if (pinnedMode) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 cursor-pointer ',
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
        'flex items-center gap-3 px-4 py-2 cursor-pointer rounded-full m-1',
        'bg-gray-900/80 backdrop-blur border-b border-gray-800',
        'hover:bg-gray-800 transition',
      )}
    >
      <Pin size={18} className="text-grey-400 shrink-0" />

      <div className="flex flex-col overflow-hidden">
        <span className="text-xs text-gray-400">Pinned message{count > 1 ? `s (${count})` : ''}</span>

        <span className="text-sm text-white truncate">{pinned}</span>
      </div>
    </div>
  );
};
