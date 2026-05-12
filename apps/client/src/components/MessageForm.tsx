import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { getLastChatId } from '../utils/lastOpenChatId';
import useDebounce from '../hooks/useDebounce';
import { FORM_MODE } from '../utils/consts/formModes';
import type { FormMode } from '../api/types';
import { searchMessagesByChatId } from '../services/chats';

interface MessageForm {
  text: string;
  formMode: FormMode;
  setText: (text: string) => void;
  formButton: () => React.ReactNode;
  handleSend: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  typing: (currentChatId: number) => void;
  scrollToMessage: (id: number) => void;
}
const MessageForm = ({ text, formMode, setText, handleSend, formButton, typing, scrollToMessage }: MessageForm) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChatId = getLastChatId();

  const debouncedTyping = useDebounce((chatId: number) => {
    typing(chatId);
  }, 500);

  const debouncedSearch = useDebounce(async (value: string) => {
    const res = await searchMessagesByChatId(currentChatId, value);
    scrollToMessage(res[0].id);
  }, 300);

  useEffect(() => {
    if (textareaRef) textareaRef?.current?.focus();
  }, [handleSend]);

  function handleTyping(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setText(value);
    debouncedTyping(currentChatId);
  }
  async function handleOnChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;

    setText(value);
    if (formMode === FORM_MODE.SEARCH && value.trim().length > 0) {
      debouncedSearch(value);
    } else {
      handleTyping(e);
    }
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
        onChange={handleOnChange}
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
