import type { CreateMessage, Message, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo } from '../EntityRepo';
import type { MessageRepo } from './types';
import { selectByUserIdAndChatId } from './sql';

class MessageRepository extends EntityRepo<Message> {
  constructor(pool: TypedPool) {
    super(pool, 'message', ['id', 'text', 'userId', 'chatId', 'createdAt', 'updatedAt']);
  }

  async findByUserIdAndchatId(userId: number, chatId: number): Promise<Message[]> {
    const { query, params } = selectByUserIdAndChatId(userId, chatId);
    return await this.pool.queryAll<Message>(query, params);
  }
}
export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    // create: () => chatRepo.create({ title: 'cdcdc' }),
    create: (message: CreateMessage) => messageRepo.create(message),
    findByUserIdAndchatId: (userId: number, chatId: number) => messageRepo.findByUserIdAndchatId(userId, chatId),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, userId: number, definition: Partial<UpdateMessage>) =>
      messageRepo.update(id, definition),
    remove: (id: number) => messageRepo.remove(id),
  };
};

// create: (post: CreatePost) => postRepo.create(post),
// findOne: (definition: Partial<Post>) => postRepo.findOne(definition),
// findById: (id: number) => postRepo.findById(id),
// findAll: () => postRepo.findAll(),
// findByCategory: (category: string) => postRepo.findByCategory(category),
// findByUserId: (userId: number) => postRepo.findByUserId(userId),
// update: (id: number, definition: Partial<UpdatePost>) => postRepo.update(id, definition),
// remove: (id: number) => postRepo.remove(id),
