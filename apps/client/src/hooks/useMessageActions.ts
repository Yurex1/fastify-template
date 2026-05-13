import { toast } from 'react-toastify';
import useMessageFormStore from '../stores/messageForm';
import useChatUIStore from '../stores/chatUI';
import { searchMessagesByChatId } from '../services/chats';

interface useMessageActionsProps {
  deleteMessage: (messageId: number) => void;
}

export function useMessageActions({ deleteMessage }: useMessageActionsProps) {
  const { setFormMode, text, setText, setReplyTo } = useMessageFormStore();

  const menuForMessage = useChatUIStore((s) => s.menuForMessage);
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const handleSearch = async () => {
    const res = await searchMessagesByChatId(currentChatId, text);
    return res;
  };

  const handleEdit = () => {
    if (menuForMessage) {
      setFormMode('edit');
      setText(menuForMessage.text);
    }
  };

  const handleCopy = () => {
    if (menuForMessage?.text) {
      navigator.clipboard.writeText(menuForMessage.text);
      toast.success('Text copied');
    }
  };

  const handleReply = () => {
    if (menuForMessage) {
      setFormMode('reply');
      setReplyTo(menuForMessage);
    }
  };

  const handleDelete = () => {
    if (menuForMessage) {
      deleteMessage(menuForMessage.id);
    }
  };

  return {
    handleSearch,
    handleEdit,
    handleCopy,
    handleReply,
    handleDelete,
  };
}
