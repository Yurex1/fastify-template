import { cn } from '../lib/utils';
import emojis from '../utils/consts/emojis';

interface ToggleGroupDemoProps {
  pressedEmojis: string[];
  handleClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function EmojiMenu({ pressedEmojis, handleClick }: ToggleGroupDemoProps) {
  return (
    <div className="max-w-[300px] p-1 flex gap-1 overflow-x-scroll bg-[#212121] border border-gray-700 rounded-lg shadow-xl">
      {emojis.map((item) => (
        <button
          key={item.label}
          className={cn(
            'transition-colors rounded-full p-1 text-xl',
            pressedEmojis.includes(item.value) && '!bg-violet-600/50 border-violet-500',
          )}
          onClick={handleClick}
          value={item.value}
        >
          {item.value}
        </button>
      ))}
    </div>
  );
}
