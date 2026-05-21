import { ArrowDown } from 'lucide-react';

export const ScrollToBottom = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      className="fixed bottom-20 right-8 bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-500 transition-all z-[50]"
    >
      <span className="text-white">
        <ArrowDown />
      </span>
    </button>
  );
};
