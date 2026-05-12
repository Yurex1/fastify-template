import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { getLastChatId } from '../utils/lastOpenChatId';
import useDebounce from '../hooks/useDebounce';
import { FORM_MODE } from '../utils/consts/formModes';
import { searchMessagesByChatId } from '../services/chats';
import useMessageFormStore from '../stores/messageForm';

interface MessageForm {
  formButton: () => React.ReactNode;
  handleSend: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  scrollToMessage: (id: number) => void;
  typing: (id: number) => void;
}
const MessageForm = ({ handleSend, formButton, scrollToMessage, typing }: MessageForm) => {
  const { text, setText, formMode, setFormMode } = useMessageFormStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChatId = getLastChatId();
  const [resultCount, setResultCount] = useState(0);

  const debouncedTyping = useDebounce((chatId: number) => {
    typing(chatId);
  }, 500);

  const debouncedSearch = useDebounce(async (value: string) => {
    const res = await searchMessagesByChatId(currentChatId, value);
    if (res.length > 0) scrollToMessage(res[0].id);
    setResultCount(res.length);
  }, 300);

  useEffect(() => {
    if (textareaRef) textareaRef?.current?.focus();
  }, [handleSend]);

  useEffect(() => {
    setResultCount(0);
  }, [formMode]);

  useEffect(() => {
    setFormMode('create');
    setText('');
  }, [currentChatId]);

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
      {formMode === 'search' && resultCount > 0 && (
        <div className="fixed top-2">
          <div className="backdrop-blur-md bg-zinc-900/80 border border-zinc-700 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-zinc-300">Found</span>
            <span className="text-sm font-semibold text-white">{resultCount}</span>
            <span className="text-sm text-zinc-400">{resultCount === 1 ? 'result' : 'results'}</span>
          </div>
        </div>
      )}

      {formMode === 'search' && resultCount <= 0 && (
        <div className="fixed top-2">
          <div className="backdrop-blur-md bg-zinc-900/80 border border-red-500/20 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm font-medium text-zinc-300">No results found</span>
          </div>
        </div>
      )}

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
