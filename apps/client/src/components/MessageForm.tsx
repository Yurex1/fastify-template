import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface MessageForm {
  text: string;
  setText: (text: string) => void;
  formButton: () => React.ReactNode;
  handleSend: (e: React.SubmitEvent) => void;
}
const MessageForm = ({ text, setText, handleSend, formButton }: MessageForm) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef) textareaRef?.current?.focus();
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
        {formButton()}
      </button>
    </form>
  );
};

export default MessageForm;
