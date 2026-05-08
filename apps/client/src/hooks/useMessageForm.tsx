import type { Message } from '../api/types';
import useUserStore from '../stores/user';
import { FORM_MODE } from '../utils/consts/formModes';
import { SendHorizonal, Check, Search, Reply } from 'lucide-react';
import { useMessageActions } from './useMessageActions';

interface useMessageFormProps {
  currentChatId: number | null;
  messages: Message[];
  updateMessage: (messageId: number, definition: { type: string; content: any }) => void;
  sendMessage: (ChatId: number, text: string, reply_id?: number) => void;
  deleteMessage: (id: number) => void;
}

export function useMessageForm({
  sendMessage,
  messages,
  currentChatId,
  updateMessage,
  deleteMessage,
}: useMessageFormProps) {
  const { formMode, text, setText, setReplyTo, setFormMode, handleSearch } = useMessageActions({
    messages,
    deleteMessage,
  });

  const messageToEdit = useUserStore((s) => s.menuForMessage);
  const setMessageToEdit = useUserStore((s) => s.setMenuForMessage);

  const clearForm = () => {
    setMessageToEdit(null);
    setFormMode('create');
    setReplyTo(null);
    setText('');
    return;
  };

  const handleSend = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (text.trim().length <= 0) return;
    switch (formMode) {
      case FORM_MODE.CREATE:
        if (currentChatId) sendMessage(currentChatId, text);
        clearForm();
        break;

      case FORM_MODE.SEARCH:
        handleSearch();
        clearForm();
        break;

      case FORM_MODE.EDIT:
        if (!messageToEdit) break;
        if (messageToEdit?.text.trim() === text.trim()) {
          clearForm();
          break;
        }
        updateMessage(messageToEdit.id, { type: 'text', content: text });
        setFormMode('create');
        clearForm();
        break;

      case FORM_MODE.REPLY:
        if (!messageToEdit || !currentChatId) break;

        sendMessage(currentChatId, text, messageToEdit.id);

        clearForm();
        break;

      default:
        setText('');
        break;
    }
  };

  const formButton = () => {
    switch (formMode) {
      case 'create':
        return <SendHorizonal />;

      case 'search':
        return <Search />;

      case 'edit':
        return <Check />;

      case 'reply':
        return <Reply />;

      default:
        break;
    }
  };
  return { clearForm, handleSend, formButton };
}
