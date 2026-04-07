import type { Chat } from '../../entities/chat';

export type ChatMemberStatus = 'pending' | 'approved' | 'rejected';

export interface ChatMemberRepo {
  addMembers: (chatId: number, members: { userId: number; status: ChatMemberStatus }[]) => Promise<void>;
  listChatsForUser: (
    userId: number,
    status: ChatMemberStatus,
    page: number,
    limit: number,
  ) => Promise<Chat[]>;
  isMember: (userId: number, chatId: number) => Promise<boolean>;
  findApprovedDirectChat: (userId: number, otherUserId: number) => Promise<Chat | null>;
}
