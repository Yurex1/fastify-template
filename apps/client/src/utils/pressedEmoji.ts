import type { Message } from '../api/types';

export const userPressedEmojis = (message: Message, currentUserId: number) => {
  return Object.entries(message.reactions || {})
    .filter(([_, userIds]) => userIds.includes(currentUserId))
    .map(([emoji]) => emoji);
};
