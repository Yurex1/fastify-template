import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByChatId = (chatId: number, offset: number = 0, limit: number = 30): RowSqlResult => ({
  query: `
    SELECT 
      m.id, 
      m."userId", 
      u.username,
      m."text", 
      m."reactions",
      m."chatId", 
      m."createdAt", 
      m."updatedAt",
      m."read",
      m."reply_id",
      CASE 
        WHEN m."reply_id" IS NOT NULL THEN 
          json_build_object(
            'id', rm.id,
            'text', rm.text,
            'userId', rm."userId",
            'username', ru.username,
            'createdAt', rm."createdAt"
          )
        ELSE NULL 
      END as "reply",
      CASE 
        WHEN pm.id IS NOT NULL THEN true 
        ELSE false 
      END as "isPinned"
    FROM "public"."message" m
    LEFT JOIN "public"."users" u ON u.id = m."userId"
    LEFT JOIN "public"."message" rm ON rm.id = m."reply_id"
    LEFT JOIN "public"."users" ru ON ru.id = rm."userId"
    LEFT JOIN "public"."chat_pinned_message" pm 
      ON pm.message_id = m.id AND pm.chat_id = $1
    WHERE m."chatId" = $1
    ORDER BY m."createdAt" DESC 
    LIMIT $2 OFFSET $3
  `,
  params: [chatId, limit, offset],
});

export const selectOneById = (id: number): RowSqlResult => ({
  query: `
    SELECT
      m.id, m."userId", u.username,
      m.text, m.reactions, m."chatId",
      m."createdAt", m."updatedAt", m.read, m.reply_id,
      CASE
        WHEN m.reply_id IS NOT NULL THEN
          json_build_object(
            'id', rm.id,
            'text', rm.text,
            'userId', rm."userId",
            'username', ru.username,
            'createdAt', rm."createdAt"
          )
        ELSE NULL
      END AS reply
    FROM "public"."message" m
    LEFT JOIN "public"."users" u ON u.id = m."userId"
    LEFT JOIN "public"."message" rm ON rm.id = m.reply_id
    LEFT JOIN "public"."users" ru ON ru.id = rm."userId"
    WHERE m.id = $1
  `,
  params: [id],
});

export const searchInChat = (chatId: number, text: string): RowSqlResult => ({
  query: ` 
    SELECT 
      m."id",
      m."text",
      m."createdAt",
      m."chatId"
    FROM "public"."message" m
    WHERE m."chatId" = $1 
      AND m."text" ILIKE $2
    ORDER BY m."createdAt" DESC
  `,
  params: [chatId, `%${text}%`],
});

export const updateReactions = (id: number, userId: number, reaction: string): RowSqlResult => ({
  query: `
    UPDATE "public"."message"
    SET "reactions" = CASE 
      WHEN COALESCE("reactions"->$2, '[]'::jsonb) @> $3::jsonb THEN
        CASE 
          WHEN jsonb_array_length(COALESCE("reactions"->$2, '[]'::jsonb)) <= 1 
          THEN COALESCE("reactions", '{}'::jsonb) - $2
          ELSE jsonb_set(
            "reactions", 
            ARRAY[$2], 
            (
              SELECT jsonb_agg(elem) 
              FROM jsonb_array_elements("reactions"->$2) AS elem 
              WHERE elem::text <> $4::text
            )
          )
        END
      ELSE jsonb_set(
        COALESCE("reactions", '{}'::jsonb), 
        ARRAY[$2], 
        COALESCE("reactions"->$2, '[]'::jsonb) || $3::jsonb
      )
    END
    WHERE "id" = $1
    RETURNING *;
  `,
  params: [id, reaction, JSON.stringify([userId]), userId],
});

export const getMessagePage = (chatId: number, messageId: number, limit: number): RowSqlResult => ({
  query: `
    SELECT CEIL(COUNT(*)::float / $3)::int AS page
    FROM "public"."message"
    WHERE "chatId" = $1
      AND "createdAt" >= (
        SELECT "createdAt" FROM "public"."message" WHERE id = $2 AND "chatId" = $1
      )
  `,
  params: [chatId, messageId, limit],
});
