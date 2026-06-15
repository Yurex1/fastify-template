import useChatUIStore from '../stores/chatUI';

const TypingBlock = () => {
  const isTyping = useChatUIStore((s) => s.isTyping);
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  if (isTyping.chatId !== currentChatId) return null;
  if (!isTyping.isTyping) return null;

  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex gap-2 items-end bg-black px-4 py-2 rounded-2xl rounded-bl-sm border">
        <div className="text-gray-500">{`${isTyping.userName} is typing`}</div>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-gray-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default TypingBlock;
