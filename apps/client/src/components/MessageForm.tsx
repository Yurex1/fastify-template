import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { getLastChatId } from '../utils/lastOpenChatId';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuthStore } from '../stores/auth';
import { debounce } from '../utils/debouce';

interface MessageForm {
  text: string;
  setText: (text: string) => void;
  formButton: () => React.ReactNode;
  handleSend: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}
const MessageForm = ({ text, setText, handleSend, formButton }: MessageForm) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChatId = getLastChatId();
  const currentUser = useAuthStore((s) => s.user);
  const { typing } = useWebSocket({ currentChatId });

  useEffect(() => {
    if (textareaRef) textareaRef?.current?.focus();
  }, [handleSend]);

  function handleTyping(e: React.ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
    setText(e.target.value);
    if (!currentUser) return;
    debounce(() => typing(currentUser.id), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (!text.trim()) return;

      handleSend(e);
    }
  }

  return (
    <form className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-center">
      <TextareaAutosize
        ref={textareaRef}
        value={text}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        minRows={1}
        maxRows={10}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none resize-none"
        placeholder="Message..."
      />
      <button className="bg-blue-600 px-3 py-2 rounded-xl text-white font-medium hover:bg-blue-500 transition-colors">
        {formButton()}
      </button>
    </form>
  );
};

export default MessageForm;
