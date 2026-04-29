import type { FormMode, Message } from '../api/types';
import { FORM_MODE } from '../utils/consts/formModes';
import { SendHorizonal, Check, Search } from 'lucide-react';

interface useMessageFormProps {
  currentChatId: number | null;
  text: string;
  setText: (text: string) => void;
  formMode: FormMode;
  setFormMode: (text: FormMode) => void;
  messageToEdit: Message | null;
  setMessageToEdit: (message: Message | null) => void;
  updateMessage: (id: number, text: string) => void;
  sendMessage: (ChatId: number, text: string) => void;
  handleSearch: () => void;
}

export function useMessageForm({
  currentChatId,
  text,
  formMode,
  messageToEdit,
  setText,
  setFormMode,
  setMessageToEdit,
  updateMessage,
  sendMessage,
  handleSearch,
}: useMessageFormProps) {
  const clearForm = () => {
    setMessageToEdit(null);
    setFormMode('create');
    setText('');
    return;
  };

  const handleSend = (e: React.SubmitEvent) => {
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
        updateMessage(messageToEdit.id, text);
        setMessageToEdit(null);
        setFormMode('create');
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

      default:
        break;
    }
  };
  return { clearForm, handleSend, formButton };
}
