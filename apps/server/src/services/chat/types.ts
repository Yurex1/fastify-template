import type { ChatPreview } from '../../entities/chat';
import type { ChatRepo } from '../../data/chat/types';
import type { ChatMemberRepo, ChatMemberStatus } from '../../data/chatMember/types';
import type { UserRepo } from '../../data/user/types';
import { Message, UpdateMessage } from '../../entities/message';
import { MessageRepo } from '../../data/message/types';
import { ChatMember } from '../../entities/chatMember';
import { PinnedMessagesRepo } from '../../data/pinnedMessages/types';
import { PinnedMessage, PinnedMessageList } from '../../entities/pinnedMessages';

export interface ChatService {
  create: (userId: number, memberId: number) => Promise<ChatPreview>;
  list: (userId: number, status: ChatMemberStatus, page: number, limit: number) => Promise<ChatPreview[]>;
  getAllMembers: (userId: number) => Promise<ChatMember[]>;
  getAllMembersByChatId: (chatId: number) => Promise<ChatMember[]>;
  findMessage: (definition: Partial<Message>) => Promise<Message | null>;
  removeMessage: (id: number) => Promise<{ removed: boolean }>;
  sendMessage: (userId: number, chatId: number, text: string, reply_id?: number) => Promise<Message>;
  getMessagesByChatId: (userId: number, chatId: number, page: number, limit: number) => Promise<Message[]>;
  searchMessagesByChatId: (userId: number, chatId: number, text: string) => Promise<Message[]>;
  getAllPinnedMessages: (chatId: number, page: number, limit: number) => Promise<PinnedMessageList>;
  updateMessage: (id: number, definition: UpdateMessage) => Promise<Message>;
  updateReactions: (id: number, userId: number, reaction: string) => Promise<Message | null>;
  getMessagePage: (chatId: number, messageId: number, limit: number) => Promise<{ page: number }>;
  pinMessage: (userId: number, chatId: number, messageId: number) => Promise<PinnedMessage>;
  unpinMessage: (userId: number, chatId: number, messageId: number) => Promise<{ chatId: number; messageId: number }>;
  removeChat: (userId: number, chatId: number) => Promise<{ removed: boolean }>;
}

export interface Deps {
  chatRepo: ChatRepo;
  chatMemberRepo: ChatMemberRepo;
  userRepo: UserRepo;
  messageRepo: MessageRepo;
  pinnedMessagesRepo: PinnedMessagesRepo;
}
