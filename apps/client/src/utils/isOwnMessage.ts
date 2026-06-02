import type { Chat } from '../api/chats/types';

export const isOwnMessage = (messageUserId: number, userId: number) => messageUserId === userId;

export const member = (chat: Chat, userId: number) => {
  return chat.members.find((m) => m.userId !== userId);
};
