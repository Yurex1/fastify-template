import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo, SqlBuilder } from '../EntityRepo';
import type { MessageRepo } from './types';
import { getMessagePage, searchInChat, selectByChatId, selectOneById, updateReactions } from './sql';

class MessageRepository extends EntityRepo<Message> {
  constructor(pool: TypedPool) {
    super(pool, 'message', [
      'id',
      'text',
      'read',
      'userId',
      'chatId',
      'createdAt',
      'updatedAt',
      'reactions',
      'reply_id',
    ]);
  }

  async create(data: CreateMessage): Promise<Message> {
    const { query, params } = SqlBuilder.buildCreateQuery(this.tableName, ['id'], data);
    const row = await this.pool.queryOne<{ id: number }>(query, params);

    const { query: q, params: p } = selectOneById(row!.id);
    return (await this.pool.queryOne<Message>(q, p))!;
  }

  async findByChatId(chatId: number, page: number = 1, limit: number = 30): Promise<Message[]> {
    const offset = (page - 1) * limit;

    const { query, params } = selectByChatId(chatId, offset, limit);
    return await this.pool.queryAll<Message>(query, params);
  }

  async findAllByChatId(chatId: number, text: string): Promise<Message[]> {
    const { query, params } = searchInChat(chatId, text);
    return await this.pool.queryAll<Message>(query, params);
  }

  async updateReactions(id: number, userId: number, reaction: string): Promise<Message | null> {
    const { query, params } = updateReactions(id, userId, reaction);
    return await this.pool.queryOne<Message | null>(query, params);
  }

  async getMessagePage(chatId: number, messageId: number, limit: number = 30): Promise<number> {
    const { query, params } = getMessagePage(chatId, messageId, limit);
    const result = await this.pool.queryOne<{ page: number }>(query, params);
    return result?.page ?? 1;
  }
}

export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    create: (message: CreateMessage) => messageRepo.create(message),
    findByChatId: (chatId: number, page: number, limit: number) => messageRepo.findByChatId(chatId, page, limit),
    findAllByChatId: (chatId: number, text: string) => messageRepo.findAllByChatId(chatId, text),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, definition: Partial<UpdateMessage>) => messageRepo.update(id, definition),
    updateReactions: (id: number, userId: number, reaction: string) =>
      messageRepo.updateReactions(id, userId, reaction),
    getMessagePage: (chatId: number, messageId: number, limit: number) =>
      messageRepo.getMessagePage(chatId, messageId, limit),
    remove: (id: number) => messageRepo.remove(id),
  };
};
