import { CreatePinnedMessage, PinnedMessage, PinnedMessageList } from '../../entities/pinnedMessages';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import { deleteByChatAndMessage, selectByChatId } from './sql';
import type { PinnedMessagesRepo, PinnedMessagesCursor } from './types';

class PinnedMessagesRepository extends EntityRepo<PinnedMessage> {
  constructor(pool: TypedPool) {
    super(pool, 'chat_pinned_message', ['id', 'chat_id', 'message_id', 'pinned_at']);
  }

  async findByChatId(
    chatId: number,
    cursor: PinnedMessagesCursor | null = null,
    limit: number = 30,
  ): Promise<PinnedMessageList> {
    const { query, params } = selectByChatId(chatId, cursor, limit);

    const rows = await this.pool.queryOne<{
      totalCount: number;
      data: PinnedMessage[];
    }>(query, params);

    if (!rows) {
      return { totalCount: 0, data: [], nextCursor: null };
    }

    const hasMore = rows.data.length > limit;
    const page = rows.data.slice(0, limit);

    let nextCursor: PinnedMessagesCursor | null = null;
    if (hasMore && page.length > 0) {
      const lastItem = page[page.length - 1];

      if (lastItem?.message?.createdAt != null) {
        nextCursor = {
          createdAt: lastItem.message.createdAt,
          id: lastItem.id,
        };
      }
    }

    return {
      data: page,
      totalCount: rows.totalCount,
      nextCursor,
    };
  }

  async removeByMessageId(chatId: number, messageId: number): Promise<{ chatId: number; messageId: number }> {
    const { query, params } = deleteByChatAndMessage(chatId, messageId);

    const result = await this.pool.queryOne<{ chat_id: number; message_id: number }>(query, params);

    if (!result) {
      throw new Error('PINNED_MESSAGE_NOT_FOUND');
    }

    return {
      chatId: result.chat_id,
      messageId: result.message_id,
    };
  }
}

export const init = (pool: TypedPool): PinnedMessagesRepo => {
  const pinnedMessagesRepo = new PinnedMessagesRepository(pool);

  return {
    create: (message: CreatePinnedMessage) => pinnedMessagesRepo.create(message),
    findByChatId: (chatId: number, cursor: PinnedMessagesCursor, limit: number) =>
      pinnedMessagesRepo.findByChatId(chatId, cursor, limit),
    findOne: (definition: Partial<PinnedMessage>) => pinnedMessagesRepo.findOne(definition),
    removeByMessageId: (chatId: number, messageId: number) => pinnedMessagesRepo.removeByMessageId(chatId, messageId),
  };
};
