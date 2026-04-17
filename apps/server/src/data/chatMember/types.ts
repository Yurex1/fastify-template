import type { Chat, ChatPreview } from '../../entities/chat';

export enum ChatMemberStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ChatMemberRepo {
  addMembers(chatId: number, members: { userId: number; status: ChatMemberStatus }[]): Promise<void>;
  listChatsForUser: (userId: number, status: ChatMemberStatus, page: number, limit: number) => Promise<ChatPreview[]>;
  getAllMembersByChatId: (chatId: number) => Promise<number[] | []>;
  isMember: (userId: number, chatId: number) => Promise<boolean>;
  findDirectChat: (userId: number, otherUserId: number) => Promise<Chat | null>;
}
