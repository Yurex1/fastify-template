import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../api/chats/types';

interface Props {
  message: Message;
  userName: string;
  onClose: () => void;
}

export const ReplyBlock = ({ message, userName, onClose }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex items-center justify-between min-w-0 shrink-0">
      <div className="flex flex-col min-w-0 flex-1 mr-2">
        <span className="text-xs text-gray-400 truncate block">{t('replyBlock.replyingTo', { userName })}</span>
        <span className="text-sm text-white truncate block">{message.text}</span>
      </div>

      <button onClick={onClose} aria-label="close reply mode" className="text-gray-400 hover:text-white shrink-0">
        <X size={16} />
      </button>
    </div>
  );
};
