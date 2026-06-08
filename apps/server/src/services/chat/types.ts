import type { ChatPreview } from '../../entities/chat';
import type { ChatRepo } from '../../data/chat/types';
import type { ChatCursor, ChatMemberRepo, ChatMemberStatus, ListResult } from '../../data/chatMember/types';
import type { UserRepo } from '../../data/user/types';
import { Message, MessageSearchResult, UpdateMessage } from '../../entities/message';
import { CursorResult, FindByChatIdProps, MessageRepo } from '../../data/message/types';
import { ChatMember } from '../../entities/chatMember';
import { PinnedMessagesCursor, PinnedMessagesRepo } from '../../data/pinnedMessages/types';
import { PinnedMessage, PinnedMessageList } from '../../entities/pinnedMessages';

export interface ChatService {
  create: (userId: number, memberId: number, lang: string) => Promise<ChatPreview>;
  list: (userId: number, status: ChatMemberStatus, cursor: ChatCursor | null, limit: number) => Promise<ListResult>;
  getAllMembers: (userId: number) => Promise<ChatMember[]>;
  getAllMembersByChatId: (chatId: number) => Promise<ChatMember[]>;
  findMessage: (definition: Partial<Message>) => Promise<Message | null>;
  removeMessage: (id: number) => Promise<{ removed: boolean }>;
  sendMessage: (userId: number, chatId: number, text: string, lang: string, reply_id?: number) => Promise<Message>;
  getMessagesByChatId: (
    userId: number,
    chatId: number,
    { before, after, limit }: FindByChatIdProps,
    lang: string,
  ) => Promise<CursorResult>;
  searchMessagesByChatId: (
    userId: number,
    chatId: number,
    text: string,
    lang: string,
  ) => Promise<MessageSearchResult[]>;
  getAllPinnedMessages: (
    chatId: number,
    cursor: PinnedMessagesCursor,
    limit: number,
    lang: string,
  ) => Promise<PinnedMessageList>;
  updateMessage: (id: number, definition: UpdateMessage, lang: string) => Promise<Message>;
  updateReactions: (id: number, userId: number, reaction: string, lang: string) => Promise<Message | null>;
  getMessageContext: (
    userId: number,
    chatId: number,
    messageId: number,
    limit: number,
    lang: string,
  ) => Promise<CursorResult | null>;
  pinMessage: (userId: number, chatId: number, messageId: number, lang: string) => Promise<PinnedMessage>;
  unpinMessage: (
    userId: number,
    chatId: number,
    messageId: number,
    lang: string,
  ) => Promise<{ chatId: number; messageId: number }>;
  removeChat: (userId: number, chatId: number, lang: string) => Promise<{ removed: boolean }>;
}

export interface Deps {
  chatRepo: ChatRepo;
  chatMemberRepo: ChatMemberRepo;
  userRepo: UserRepo;
  messageRepo: MessageRepo;
  pinnedMessagesRepo: PinnedMessagesRepo;
}
