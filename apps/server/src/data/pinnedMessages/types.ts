import { CreatePinnedMessage, PinnedMessage, PinnedMessageList } from '../../entities/pinnedMessages';

export interface PinnedMessagesRepo {
  create: (data: CreatePinnedMessage) => Promise<PinnedMessage>;
  findByChatId: (chatId: number, page: number, limit: number) => Promise<PinnedMessageList>;
  findOne: (definition: Partial<PinnedMessage>) => Promise<PinnedMessage | null>;
  removeByMessageId: (chatId: number, messageId: number) => Promise<{ chatId: number; messageId: number }>;
}
