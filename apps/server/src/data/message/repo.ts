import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import type { MessageRepo } from './types';
import { selectByChatId } from './sql';
import { ChatMemberStatus } from '../chatMember/types';

class MessageRepository extends EntityRepo<Message> {
  constructor(pool: TypedPool) {
    super(pool, 'message', ['id', 'text', 'userId', 'chatId', 'createdAt', 'updatedAt']);
  }

  async findByChatId(chatId: number, page: number = 1, limit: number = 30): Promise<Message[]> {
    const offset = (page - 1) * limit;

    const { query, params } = selectByChatId(chatId, offset, limit);
    return await this.pool.queryAll<Message>(query, params);
  }
}

export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    create: (message: CreateMessage) => messageRepo.create(message),
    findByChatId: (chatId: number, page: number, limit: number) => messageRepo.findByChatId(chatId, page, limit),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, definition: Partial<UpdateMessage>) => messageRepo.update(id, definition),
    remove: (id: number) => messageRepo.remove(id),
  };
};
