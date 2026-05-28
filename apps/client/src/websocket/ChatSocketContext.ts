import { createContext, useContext } from 'react';

export interface ChatSocketContextProps {
  sendMessage: (chatId: number, text: string, reply_id?: number) => void;
  updateMessage: (messageId: number, definition: { type: 'text'; content: string }) => void;
  updateReaction: (id: number, userId: number, reaction: string) => void;
  deleteMessage: (messageId: number) => void;
  createRoom: (chatId: number, roomName: string, chatName: string) => void;
  typing: (chatId: number) => void;
}

export const ChatSocketContext = createContext<ChatSocketContextProps | null>(null);

export const useChatSocket = () => {
  const context = useContext(ChatSocketContext);

  if (!context) {
    throw new Error('useChatSocket must be used inside ChatSocketProvider');
  }

  return context;
};
