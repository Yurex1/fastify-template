import type { ChatPreview } from '../../entities/chat';
import type { ChatRepo } from '../../data/chat/types';
import type { ChatMember, ChatMemberRepo, ChatMemberStatus } from '../../data/chatMember/types';
import type { UserRepo } from '../../data/user/types';
import { Message, UpdateMessage } from '../../entities/message';
import { MessageRepo } from '../../data/message/types';

export interface ChatService {
  create: (userId: number, memberId: number) => Promise<ChatPreview>;
  list: (userId: number, status: ChatMemberStatus, page: number, limit: number) => Promise<ChatPreview[]>;
  getAllMembers: (userId: number) => Promise<ChatMember[]>;
  getAllMembersByChatId: (chatId: number) => Promise<ChatMember[]>;
  findMessage: (definition: Partial<Message>) => Promise<Message | null>;
  removeMessage: (id: number) => Promise<{ removed: boolean }>;
  sendMessage: (userId: number, chatId: number, text: string) => Promise<Message>;
  getMessagesByChatId: (userId: number, chatId: number, page: number, limit: number) => Promise<Message[]>;
  updateMessage: (id: number, definition: UpdateMessage) => Promise<Message>;
  updateReactions: (id: number, userId: number, reaction: string) => Promise<Message | null>;
  removeChat: (userId: number, chatId: number) => Promise<{ removed: boolean }>;
}

export interface Deps {
  chatRepo: ChatRepo;
  chatMemberRepo: ChatMemberRepo;
  userRepo: UserRepo;
  messageRepo: MessageRepo;
}
