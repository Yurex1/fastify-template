import type { CreateMessage, Message, MessageSearchResult, UpdateMessage } from '../../entities/message';
import type { TypedPool } from '../../infra/pg';
import { EntityRepo, SqlBuilder } from '../EntityRepo';
import type { CursorResult, FindByChatIdProps, MessageRepo } from './types';
import { searchInChat, selectOneById, updateReactions, selectBefore, selectAfter, selectMessageContext } from './sql';

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

    if (!row) throw new Error('Failed to create message: insert returned no result');

    const { query: q, params: p } = selectOneById(row.id);
    const message = await this.pool.queryOne<Message>(q, p);

    if (!message) throw new Error(`Failed to fetch created message with id: ${row.id}`);

    return message;
  }

  async findByChatId(chatId: number, { before, after, limit = 50 }: FindByChatIdProps): Promise<CursorResult> {
    if (after !== undefined) {
      const { query, params } = selectAfter(chatId, after, limit);
      const res = await this.pool.queryAll<Message>(query, params);
      const hasMore = res.length > limit;
      const page = res.slice(0, limit);

      return {
        messages: [...page].reverse(),
        olderCursor: page.length > 0 ? page[0].id : null,
        newerCursor: hasMore ? page[page.length - 1].id : null,
      };
    }

    const { query, params } = selectBefore(chatId, before ?? null, limit);
    const res = await this.pool.queryAll<Message>(query, params);

    const hasOlder = res.length > limit;
    const page = res.slice(0, limit);

    return {
      messages: page,
      olderCursor: hasOlder ? (page[page.length - 1]?.id ?? null) : null,
      newerCursor: before ? (page[0]?.id ?? null) : null,
    };
  }

  async findAllByChatId(chatId: number, text: string): Promise<MessageSearchResult[]> {
    const { query, params } = searchInChat(chatId, text);
    return await this.pool.queryAll<MessageSearchResult>(query, params);
  }

  async updateReactions(id: number, userId: number, reaction: string): Promise<Message | null> {
    const { query, params } = updateReactions(id, userId, reaction);
    return await this.pool.queryOne<Message | null>(query, params);
  }

  async getMessageContext(chatId: number, messageId: number, limit = 50): Promise<CursorResult> {
    const half = Math.ceil(limit / 2);

    const { query, params } = selectMessageContext(chatId, messageId, half + 1);
    const messages = await this.pool.queryAll<Message>(query, params);

    if (!messages || messages.length === 0) {
      return { messages: [], olderCursor: null, newerCursor: null };
    }

    const olderGroup = messages.filter((m) => m.id <= messageId);
    const newerGroup = messages.filter((m) => m.id > messageId);

    const hasOlder = olderGroup.length > 1;
    const hasNewer = newerGroup.length > 1;

    const trimmedOlder = hasOlder ? olderGroup.slice(1) : olderGroup;
    const trimmedNewer = hasNewer ? newerGroup.slice(0, -1) : newerGroup;

    return {
      messages: [...trimmedOlder, ...trimmedNewer].reverse(),
      olderCursor: hasOlder ? trimmedOlder[0].id : null,
      newerCursor: hasNewer ? trimmedNewer[trimmedNewer.length - 1].id : null,
    };
  }
}

export const init = (pool: TypedPool): MessageRepo => {
  const messageRepo = new MessageRepository(pool);

  return {
    create: (message: CreateMessage) => messageRepo.create(message),
    findByChatId: (chatId: number, { before, after, limit }: FindByChatIdProps) =>
      messageRepo.findByChatId(chatId, { before, after, limit }),
    findAllByChatId: (chatId: number, text: string) => messageRepo.findAllByChatId(chatId, text),
    findOne: (definition: Partial<Message>) => messageRepo.findOne(definition),
    updateMessage: (id: number, definition: Partial<UpdateMessage>) => messageRepo.update(id, definition),
    updateReactions: (id: number, userId: number, reaction: string) =>
      messageRepo.updateReactions(id, userId, reaction),
    getMessageContext: (chatId: number, messageId: number, limit: number) =>
      messageRepo.getMessageContext(chatId, messageId, limit),
    remove: (id: number) => messageRepo.remove(id),
  };
};
