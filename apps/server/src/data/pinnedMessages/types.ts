import { CreatePinnedMessage, PinnedMessage, PinnedMessageList } from '../../entities/pinnedMessages';

export type PinnedMessagesCursor = {
  createdAt: Date | null;
  id: number | null;
};

export interface PinnedMessagesRepo {
  create: (data: CreatePinnedMessage) => Promise<PinnedMessage>;
  findByChatId: (chatId: number, cursor: PinnedMessagesCursor, limit: number) => Promise<PinnedMessageList>;
  findOne: (definition: Partial<PinnedMessage>) => Promise<PinnedMessage | null>;
  removeByMessageId: (chatId: number, messageId: number) => Promise<{ chatId: number; messageId: number }>;
}
