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

  // async getAllMembersByChatId(chatId: number): Promise<{ userId: number; username: string }[]> {
  //   const result = await pool.query<{ userId: number; username: string }>(
  //     `SELECT
  //    cm."userId",
  //    u."username"
  //  FROM "public"."chatMember" cm
  //  JOIN "public"."users" u ON cm."userId" = u.id
  //  WHERE cm."chatId" = $1`,
  //     [chatId],
  //   );

  //   return result.rows.map((row) => row);
  // },

  async getAllMembersByChatId(chatId) {
    const rows = await pool.queryAll(
      `
    SELECT 
      m."userId", 
      u.username, 
      u.lastseen,
      (u.lastseen > NOW() - INTERVAL '5 minutes') as "isOnline"
    FROM "public"."chatMember" m
    INNER JOIN "public"."users" u ON u.id = m."userId"
    WHERE m."chatId" = $1
  `,
      [chatId],
    );

    return rows;
  },

  async getAllMembers(userId: number): Promise<{ userId: number; username: string }[]> {
    const result = await pool.query<{ userId: number; username: string }>(
      `SELECT DISTINCT
            u.id AS "userId",
            u.username
        FROM "public"."chatMember" cm1
        JOIN "public"."chatMember" cm2 ON cm1."chatId" = cm2."chatId"
        JOIN "public"."users" u ON cm2."userId" = u.id
        WHERE cm1."userId" = $1 AND cm2."userId" != $1
  `,
      [userId],
    );

    return result.rows.map((row) => row);
  },

  async listChatsForUser(userId, status, page, limit) {
    const offset = (page - 1) * limit;

    const rows = await pool.queryAll(
      `
    SELECT c.id, c."createdAt", c."updatedAt", u.id as "memberId", u.username, u.lastseen,
      (u.lastseen > NOW() - INTERVAL '5 minutes') as "isOnline"
    FROM "public"."chats" c
    INNER JOIN "public"."chatMember" m 
      ON m."chatId" = c.id
      AND m."userId" = $1
      AND m.status = $2::chat_member_status
    INNER JOIN "public"."chatMember" m2 
      ON m2."chatId" = c.id
      AND m2."userId" != $1
    INNER JOIN "public"."users" u 
      ON u.id = m2."userId"
    ORDER BY c."updatedAt" DESC
    LIMIT $3 OFFSET $4
    `,
      [userId, status, limit, offset],
    );

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      members: [
        {
          userId: row.memberId,
          username: row.username,
          isOnline: row.isOnline,
          lastseen: row.lastseen,
        },
      ],
    }));
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
