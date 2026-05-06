import { CreatePinnedMessage, PinnedMessage } from '../../entities/pinnedMessages';

export interface PinnedMessagesRepo {
  create: (data: CreatePinnedMessage) => Promise<PinnedMessage>;
  findByChatId: (chatId: number, page: number, limit: number) => Promise<PinnedMessage[]>;
  findOne: (definition: Partial<PinnedMessage>) => Promise<PinnedMessage | null>;
  removeByMessageId: (messageId: number, chatId: number) => Promise<{ messageId: number; chatId: number }>;
}
