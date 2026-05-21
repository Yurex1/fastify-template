import type { TypedPool } from '../../infra/pg';
import type { Chat, ChatPreview } from '../../entities/chat';
import type { ChatMemberRepo, ChatMemberStatus } from './types';
import { ChatMember } from '../../entities/chatMember';
import { checkMember, selectAllMembers, selectAllMembersByChatId, selectChatsForUser, selectDirectChat } from './sql';

export const init = (pool: TypedPool): ChatMemberRepo => ({
  async addMembers(chatId, members) {
    if (members.length === 0) return;
    let n = 2;
    const placeholders = members
      .map(() => {
        const chunk = `($1, $${n}, $${n + 1}::chat_member_status)`;
        n += 2;
        return chunk;
      })
      .join(', ');
    const params: (number | ChatMemberStatus)[] = [chatId];
    for (const m of members) {
      params.push(m.userId, m.status);
    }
    await pool.query(`INSERT INTO "public"."chatMember" ("chatId", "userId", status) VALUES ${placeholders}`, params);
  },

  async getAllMembersByChatId(chatId) {
    const { query, params } = selectAllMembersByChatId(chatId);
    return await pool.queryAll<ChatMember>(query, params);
  },

  async getAllMembers(userId) {
    const { query, params } = selectAllMembers(userId);
    return await pool.queryAll<ChatMember>(query, params);
  },

  async listChatsForUser(userId, status, cursor, limit) {
    const { query, params } = selectChatsForUser(userId, status, cursor, limit);

    const chats = await pool.queryAll<ChatPreview>(query, params);
    const hasOlder = chats.length > limit;
    const page = chats.slice(0, limit);

    const nextCursor = {
      updatedAt: hasOlder ? page[page.length - 1].updatedAt.toISOString() : null,
      id: hasOlder ? page[page.length - 1].id : null,
    };

    return { chats: page, nextCursor };
  },

  async isMember(userId, chatId) {
    const { query, params } = checkMember(chatId, userId);
    const row = await pool.queryOne<boolean>(query, params);
    return !!row;
  },

  async findDirectChat(userId: number, otherUserId: number) {
    const { query, params } = selectDirectChat(userId, otherUserId);
    return await pool.queryOne<Chat | null>(query, params);
  },
});
