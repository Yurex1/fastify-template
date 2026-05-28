import type { Chat, ChatPreview } from '../../entities/chat';
import type { ChatMember } from '../../entities/chatMember';

export enum ChatMemberStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type ChatCursor = {
  updatedAt: string | null;
  id: number | null;
};

export type ListResult = {
  chats: ChatPreview[];
  nextCursor: ChatCursor;
};

export interface ChatMemberRepo {
  addMembers(chatId: number, members: { userId: number; status: ChatMemberStatus }[]): Promise<void>;
  listChatsForUser: (
    userId: number,
    status: ChatMemberStatus,
    cursor: ChatCursor | null,
    limit: number,
  ) => Promise<ListResult>;
  getAllMembersByChatId: (chatId: number) => Promise<ChatMember[]>;
  getAllMembers: (userId: number) => Promise<ChatMember[]>;
  isMember: (userId: number, chatId: number) => Promise<boolean>;
  findDirectChat: (userId: number, otherUserId: number) => Promise<Chat | null>;
}
