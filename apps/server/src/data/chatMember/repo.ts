import type { TypedPool } from '../../infra/pg';
import type { Chat } from '../../entities/chat';
import type { ChatMemberRepo, ChatMemberStatus } from './types';

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

  async getAllMembersByChatId(chatId: number): Promise<number[]> {
    const result = await pool.query<{ userId: number }>(
      `SELECT "userId" FROM "public"."chatMember" 
     WHERE "chatId" = $1`,
      [chatId],
    );

    return result.rows.map((row) => row.userId);
  },

  async listChatsForUser(userId, status, page, limit) {
    const offset = (page - 1) * limit;
    return pool.queryAll<Chat>(
      `
      SELECT c.id, c."createdAt", c."updatedAt"
      FROM "public"."chats" c
      INNER JOIN "public"."chatMember" m ON m."chatId" = c.id
      WHERE m."userId" = $1 AND m.status = $2::chat_member_status
      ORDER BY c."updatedAt" DESC
      LIMIT $3 OFFSET $4
      `,
      [userId, status, limit, offset],
    );
  },

  async isMember(userId, chatId) {
    const row = await pool.queryOne<{ ok: number }>(
      `SELECT 1 AS ok FROM "public"."chatMember" WHERE "chatId" = $1 AND "userId" = $2 LIMIT 1`,
      [chatId, userId],
    );
    return !!row;
  },

  async findDirectChat(userId: number, otherUserId: number) {
    return pool.queryOne<Chat>(
      `
    SELECT c.id, c."createdAt", c."updatedAt"
    FROM "public"."chats" c
    INNER JOIN "public"."chatMember" m1 ON m1."chatId" = c.id AND m1."userId" = $1
    INNER JOIN "public"."chatMember" m2 ON m2."chatId" = c.id AND m2."userId" = $2
    WHERE NOT EXISTS (
      SELECT 1 FROM "public"."chatMember" mx
      WHERE mx."chatId" = c.id AND mx."userId" NOT IN ($1, $2)
    )
    LIMIT 1
    `,
      [userId, otherUserId],
    );
  },
});
