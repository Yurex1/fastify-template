import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import type { MessageRepo } from './types';
import { selectByUserIdAndChatId } from './sql';

class MessageRepository extends EntityRepo<Message> {
  constructor(pool: TypedPool) {
    super(pool, 'message', ['id', 'text', 'userId', 'chatId', 'createdAt', 'updatedAt']);
  }

  async findByUserIdAndChatId(userId: number, chatId: number): Promise<Message[]> {
    const { query, params } = selectByUserIdAndChatId(userId, chatId);
    return await this.pool.queryAll<Message>(query, params);
  }
}
export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    create: (message: CreateMessage) => messageRepo.create(message),
    findByUserIdAndChatId: (userId: number, chatId: number) => messageRepo.findByUserIdAndChatId(userId, chatId),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, userId: number, definition: Partial<UpdateMessage>) =>
      messageRepo.update(id, definition),
    remove: (id: number) => messageRepo.remove(id),
  };
};
