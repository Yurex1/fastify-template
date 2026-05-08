import { X } from 'lucide-react';
import type { Message } from '../api/types';

interface Props {
  message: Message;
  userName: string;
  onClose: () => void;
}

export const ReplyBlock = ({ message, userName, onClose }: Props) => {
  return (
    <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs text-gray-400">{`Replying to ${userName}`}</span>
        <span className="text-sm text-white truncate">{message.text}</span>
      </div>

      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};
