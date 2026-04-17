import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import type { FormMode, Message } from '../api/auth/types';
import { sendMessage, updateMessage } from '../services/chatSocket';
import { SendHorizonal, Check } from 'lucide-react';
const MessageForm = ({
  currentChatId,
  ws,
  text,
  setText,
  formMode,
  setFormMode,
  messageToEdit,
  setMessageToEdit,
}: {
  currentChatId: number | null;
  ws: WebSocket;
  text: string;
  setText: (text: string) => void;
  formMode: string;
  setFormMode: (text: FormMode) => void;
  messageToEdit: Message;
  setMessageToEdit: (text: Message) => void;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleSend = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (text.trim().length <= 0) return;
    if (formMode === 'create') {
      sendMessage(ws, currentChatId, text);
    } else {
      updateMessage(ws, messageToEdit.id, text);
      setMessageToEdit(null);
      setFormMode('create');
    }
    setText('');
  };

  useEffect(() => {
    ref.current.focus();
  }, [handleSend]);

  return (
    <form onSubmit={handleSend} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-end">
      <TextareaAutosize
        ref={ref}
        cacheMeasurements
        value={text}
        onChange={(e) => setText(e.target.value)}
        minRows={1}
        maxRows={10}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none resize-none"
        placeholder="Напишіть повідомлення..."
      />
      <button className="bg-blue-600 px-3 py-2 h-[43px] rounded-xl text-white font-medium hover:bg-blue-500 transition-colors">
        {formMode === 'create' ? <SendHorizonal /> : <Check />}
      </button>
    </form>
  );
};

export default MessageForm;
