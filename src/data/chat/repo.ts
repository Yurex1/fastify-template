import type { Chat, CreateChat, UpdateChat } from '../../entities/chat';
import type { TypedPool } from '../../infra/pg';

import { CreateEntity, EntityRepo } from '../EntityRepo';
import type { ChatRepo } from './types';

class ChatRepository extends EntityRepo<Chat> {
  constructor(pool: TypedPool) {
    super(pool, 'chats', ['id', 'createdAt', 'updatedAt']);
  }

  override async create(_data: CreateEntity<Chat> = { title: 'cdcdc' }): Promise<Chat> {
    const returning = this.fields.map((f) => `"${String(f)}"`).join(', ');
    const query = `
      INSERT INTO "public"."${this.tableName}" DEFAULT VALUES
      RETURNING ${returning};
    `;
    const result = await this.pool.queryOne<Chat>(query, []);
    return result!;
  }
}

export const init = (pool: TypedPool): ChatRepo => {
  const chatRepo = new ChatRepository(pool);

  return {
    create: (chat: CreateChat) => chatRepo.create(chat),
    findOne: (definition: Partial<Chat>) => chatRepo.findOne(definition),
    update: (id: number, definition: Partial<UpdateChat>) => chatRepo.update(id, definition),
    remove: (id: number) => chatRepo.remove(id),
  };
};
