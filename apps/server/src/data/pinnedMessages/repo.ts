import { CreatePinnedMessage, PinnedMessage } from '../../entities/pinnedMessages';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import { deleteByChatAndMessage, selectByChatId } from './sql';
import type { PinnedMessagesRepo } from './types';

class PinnedMessagesRepository extends EntityRepo<PinnedMessage> {
  constructor(pool: TypedPool) {
    super(pool, 'chat_pinned_message', ['id', 'chat_id', 'message_id', 'pinned_at']);
  }

  async findByChatId(chatId: number, page: number = 1, limit: number = 30): Promise<PinnedMessage[]> {
    const offset = (page - 1) * limit;

    const { query, params } = selectByChatId(chatId, offset, limit);
    return await this.pool.queryAll<PinnedMessage>(query, params);
  }

  async removeByMessageId(chatId: number, messageId: number): Promise<{ messageId: number; chatId: number }> {
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
    findByChatId: (chatId: number, page: number, limit: number) => pinnedMessagesRepo.findByChatId(chatId, page, limit),
    findOne: (definition: Partial<PinnedMessage>) => pinnedMessagesRepo.findOne(definition),
    removeByMessageId: (messageId: number, chatId: number) => pinnedMessagesRepo.removeByMessageId(messageId, chatId),
  };
};
