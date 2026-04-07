import { Chat } from '../../entities/chat';
import type { TypedPool } from '../../infra/pg';
import type { CreateEntity } from '../EntityRepo';

import { EntityRepo } from '../EntityRepo';
import { ChatRepo } from './types';

class ChatRepository extends EntityRepo<Chat> {
  constructor(pool: TypedPool) {
    super(pool, 'chats', ['id', 'createdAt', 'updatedAt']);
  }

  override async create(_data: CreateEntity<Chat> = {}): Promise<Chat> {
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
    create: () => chatRepo.create({}),
    findOne: (definition: Partial<Chat>) => chatRepo.findOne(definition),
    remove: (id: number) => chatRepo.remove(id),
  };
};
