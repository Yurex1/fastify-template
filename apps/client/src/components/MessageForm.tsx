import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import type { FormMode, Message } from '../api/types';
import { SendHorizonal, Check, Search } from 'lucide-react';
import { FORM_MODE } from '../utils/consts/formModes';

interface MessageForm {
  currentChatId: number | null;

  text: string;
  setText: (text: string) => void;
  formMode: FormMode;
  setFormMode: (text: FormMode) => void;
  messageToEdit: Message;
  setMessageToEdit: (text: Message) => void;
  updateMessage: (id: number, text: string) => void;
  sendMessage: (ChatId: number, text: string) => void;

  handleSearch: () => void;
}
const MessageForm = ({
  currentChatId,

  text,
  setText,
  formMode,
  setFormMode,
  messageToEdit,
  setMessageToEdit,
  updateMessage,
  sendMessage,

  handleSearch,
}: MessageForm) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (text.trim().length <= 0) return;
    if (formMode === FORM_MODE.CREATE) {
      sendMessage(currentChatId, text);
    }
    if (formMode === FORM_MODE.SEARCH) {
      handleSearch();
    }
    if (formMode === FORM_MODE.EDIT) {
      updateMessage(messageToEdit.id, text);
      setMessageToEdit(null);
      setFormMode('create');
    }

    setText('');
  };

  useEffect(() => {
    textareaRef.current.focus();
  }, [handleSend]);

  return (
    <form onSubmit={handleSend} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-end">
      <TextareaAutosize
        ref={textareaRef}
        cacheMeasurements
        value={text}
        onChange={(e) => setText(e.target.value)}
        minRows={1}
        maxRows={10}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none resize-none"
        placeholder="Message..."
      />
      <button className="bg-blue-600 px-3 py-2 h-[43px] rounded-xl text-white font-medium hover:bg-blue-500 transition-colors">
        {formMode === 'create' ? <SendHorizonal /> : formMode === 'search' ? <Search /> : <Check />}
      </button>
    </form>
  );
};

export default MessageForm;
