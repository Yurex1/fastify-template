import { RowSqlResult } from '../../utils/rowSql/types';
import { ChatCursor } from './types';

export const selectAllMembersByChatId = (chatId: number): RowSqlResult => ({
  query: `
    SELECT 
      m."userId", 
      u.username, 
      u.lastseen
      FROM "public"."chatMember" m
      INNER JOIN "public"."users" u ON u.id = m."userId"
      WHERE m."chatId" = $1
  `,

  params: [chatId],
});

export const selectAllMembers = (userId: number): RowSqlResult => ({
  query: `
  SELECT DISTINCT
          u.id AS "userId",
          u.username,
          u.lastseen
      FROM "public"."chatMember" cm1
      JOIN "public"."chatMember" cm2 ON cm1."chatId" = cm2."chatId"
      JOIN "public"."users" u ON cm2."userId" = u.id
      WHERE cm1."userId" = $1 AND cm2."userId" != $1`,

  params: [userId],
});

export const selectChatsForUser = (
  userId: number,
  status: string,
  cursor: ChatCursor | null,
  limit: number,
): RowSqlResult => ({
  query: `
    SELECT
      c.id,
      c."createdAt",
      c."updatedAt",
      json_agg(to_jsonb(u) ORDER BY u.id) AS members
    FROM "public"."chats" c
    INNER JOIN "public"."chatMember" m
      ON  m."chatId" = c.id
      AND m."userId" = $1
      AND m."status" = $2
    INNER JOIN "public"."chatMember" cm
      ON  cm."chatId" = c.id
    INNER JOIN "public"."users" u
      ON  u.id = cm."userId"
    WHERE
      $3::timestamptz IS NULL
      OR (c."updatedAt", c.id) < ($3::timestamptz, $4::int)
    GROUP BY c.id
    ORDER BY c."updatedAt" DESC, c.id DESC
    LIMIT $5
  `,
  params: [userId, status, cursor?.updatedAt ?? null, cursor?.id ?? null, limit + 1],
});

export const checkMember = (chatId: number, userId: number): RowSqlResult => ({
  query: `
  SELECT 1 AS ok FROM "public"."chatMember" 
  WHERE "chatId" = $1 
  AND "userId" = $2 LIMIT 1`,

  params: [chatId, userId],
});

export const selectDirectChat = (userId: number, otherUserId: number): RowSqlResult => ({
  query: `
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

  params: [userId, otherUserId],
});
