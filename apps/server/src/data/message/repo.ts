import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import type { MessageRepo } from './types';
import { selectByChatId, updateReactions } from './sql';

class MessageRepository extends EntityRepo<Message> {
  constructor(pool: TypedPool) {
    super(pool, 'message', ['id', 'text', 'read', 'userId', 'chatId', 'createdAt', 'updatedAt', 'reactions']);
  }

  async findByChatId(chatId: number, page: number = 1, limit: number = 30): Promise<Message[]> {
    const offset = (page - 1) * limit;

    const { query, params } = selectByChatId(chatId, offset, limit);
    return await this.pool.queryAll<Message>(query, params);
  }

  async updateReactions(id: number, userId: number, reaction: string): Promise<Message | null> {
    const { query, params } = updateReactions(id, userId, reaction);
    return await this.pool.queryOne<Message | null>(query, params);
  }
}

export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    create: (message: CreateMessage) => messageRepo.create(message),
    findByChatId: (chatId: number, page: number, limit: number) => messageRepo.findByChatId(chatId, page, limit),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, definition: Partial<UpdateMessage>) => messageRepo.update(id, definition),
    updateReactions: (id: number, userId: number, reaction: string) =>
      messageRepo.updateReactions(id, userId, reaction),
    remove: (id: number) => messageRepo.remove(id),
  };
};
