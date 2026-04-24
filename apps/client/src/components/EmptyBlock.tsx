import { MessageCircleMore } from 'lucide-react';

export const EmptyBlock = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 select-none">
      <div className="mb-2">
        <MessageCircleMore size={50} color="gray" />
      </div>
      <p className="text-gray-400 tracking-widest">No messages yet</p>
    </div>
  );
};
