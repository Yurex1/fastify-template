import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { getLastChatId } from '../utils/lastOpenChatId';
import useDebounce from '../hooks/useDebounce';
import { FORM_MODE } from '../utils/consts/formModes';
import { searchMessagesByChatId } from '../services/chats';
import useMessageFormStore from '../stores/messageForm';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MessageForm {
  formButton: () => React.ReactNode;
  handleSend: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  scrollToMessage: (id: number) => void;
  typing: (id: number) => void;
}
const MessageForm = ({ handleSend, formButton, scrollToMessage, typing }: MessageForm) => {
  const [resultCounter, setResultCounter] = useState(0);
  const { text, setText, formMode, setFormMode } = useMessageFormStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChatId = getLastChatId();

  const debouncedTyping = useDebounce((chatId: number) => {
    typing(chatId);
  }, 500);

  const [results, setResults] = useState<{ id: number }[]>([]);

  const debouncedSearch = useDebounce(async (value: string) => {
    const res = await searchMessagesByChatId(currentChatId, value);
    setResults(res);
    setResultCounter(0);
    if (res.length > 0) scrollToMessage(res[0].id);
  }, 300);

  useEffect(() => {
    setResults([]);
    setResultCounter(0);
  }, [formMode]);

  useEffect(() => {
    if (results.length === 0) return;
    const index = ((resultCounter % results.length) + results.length) % results.length;
    scrollToMessage(results[index].id);
  }, [resultCounter]);

  useEffect(() => {
    if (textareaRef) textareaRef?.current?.focus();
  }, [handleSend]);

  useEffect(() => {
    setFormMode('create');
    setText('');
  }, [currentChatId]);

  async function handleOnChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;

    setText(value);
    if (formMode === FORM_MODE.SEARCH && value.trim().length > 0) {
      debouncedSearch(value);
    } else {
      const value = e.target.value;
      setText(value);
      debouncedTyping(currentChatId);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (!text.trim()) return;

      handleSend(e);
    }
  }

  const currentIndex = ((resultCounter % results.length) + results.length) % results.length;
  return (
    <form className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-center">
      {formMode === 'search' && results.length > 0 && (
        <div className="fixed top-2  z-50">
          <div className="backdrop-blur-md bg-zinc-900/80 border border-zinc-700 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-zinc-300">
              <span className="text-white font-semibold">{currentIndex + 1}</span>
              <span className="text-zinc-500"> / </span>
              <span className="text-white font-semibold">{results.length}</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setResultCounter((prev) => prev - 1)}
                className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => setResultCounter((prev) => prev + 1)}
                className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {formMode === 'search' && results.length <= 0 && (
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
