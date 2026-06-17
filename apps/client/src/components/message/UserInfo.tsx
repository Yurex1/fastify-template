import { LucideSearch, MoreVertical, PhoneCall, VideoIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import useMessageFormStore from '../../stores/messageForm';
import { useCall } from '../../hooks/useCall';
import useChatUIStore from '../../stores/chatUI';
import { useUserStatus } from '../../stores/userStatus';
import { useAuthStore } from '../../stores/auth';
import { member } from '../../utils/isOwnMessage';
import { UserStatus } from '../UserStatus';

export const UserInfo = () => {
  const user = useAuthStore((s) => s.currentUser);

  const formMode = useMessageFormStore((s) => s.formMode);
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const currentChatInfo = useChatUIStore((s) => s.currentChatInfo);

  const stats = useUserStatus((s) => s.statuses);
  const { initiateCall } = useCall(currentChatId);
  const switchFormMode = useMessageFormStore((s) => s.setFormMode);

  if (!user || !currentChatInfo) return;
  const chatMember = member(currentChatInfo, user.id);
  if (!chatMember) return;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 cursor-pointer justify-between',
        'bg-black backdrop-blur border-b border-gray-800',
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src="/images/user-no-icon.png" alt="user-icon" />
        </div>
        <div className="flex flex-col">
          <p>{chatMember.username}</p>

          <UserStatus lastSeen={chatMember.lastseen || ''} isOnline={stats.includes(chatMember.userId)} />
        </div>
      </div>
      <div className="flex items-center overflow-hidden gap-5">
        <button aria-label="start audio call" onClick={() => initiateCall('audio')}>
          <PhoneCall />
        </button>

        <button aria-label="start video call" onClick={() => initiateCall('video')}>
          <VideoIcon />
        </button>

        <button
          className="self-end p-2"
          onClick={() => switchFormMode(formMode === 'search' ? 'create' : 'search')}
          aria-label={formMode === 'search' ? 'Close search' : 'Search messages'}
        >
          {formMode === 'search' ? <X /> : <LucideSearch />}
        </button>

        <span className="text-sm text-white truncate">
          <MoreVertical />
        </span>
      </div>
    </div>
  );
};
