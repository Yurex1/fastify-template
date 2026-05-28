import TextareaAutosize from 'react-textarea-autosize';
import useMessageFormStore from '../../stores/messageForm';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MessageForm {
  formButton: () => React.ReactNode;
  resultCounter: number;
  results: { id: number }[];
  navigateResult: (direction: 1 | -1) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleOnChange: React.ChangeEventHandler<HTMLTextAreaElement, HTMLTextAreaElement>;
  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

const MessageForm = ({
  formButton,
  resultCounter,
  results,
  navigateResult,
  textareaRef,
  handleOnChange,
  handleKeyDown,
}: MessageForm) => {
  const { text, formMode } = useMessageFormStore();

  const currentIndex = ((resultCounter % results.length) + results.length) % results.length;
  return (
    <form className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-center">
      {formMode === 'search' && results.length <= 0 && (
        <div className="fixed top-2">
          <div className="backdrop-blur-md bg-zinc-900/80 border border-red-500/20 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm font-medium text-zinc-300">No results found</span>
          </div>
        </div>
      )}

      {formMode === 'search' && results.length > 0 && (
        <div className="fixed top-2  z-50">
          <div className="backdrop-blur-md bg-zinc-900/80 border border-zinc-700 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-sm text-zinc-300">
              <span className="text-white font-semibold">{currentIndex + 1}</span>
              <span className="text-zinc-500"> / </span>
              <span className="text-white font-semibold">{results.length}</span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => navigateResult(-1)}
                className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigateResult(1)}
                className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronUp size={16} />
              </button>
            </div>
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
