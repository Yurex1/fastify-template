import type { Chat } from '../../entities/chat';
import type { ChatRepo } from '../../data/chat/types';
import type { ChatMemberRepo, ChatMemberStatus } from '../../data/chatMember/types';
import type { UserRepo } from '../../data/user/types';

export interface ChatService {
  create: (userId: number, memberId: number) => Promise<Chat>;
  list: (userId: number, status: ChatMemberStatus, page: number, limit: number) => Promise<Chat[]>;
  removeChat: (userId: number, chatId: number) => Promise<{ removed: boolean }>;
}

export interface Deps {
  chatRepo: ChatRepo;
  chatMemberRepo: ChatMemberRepo;
  userRepo: UserRepo;
}
