import type { RowSqlResult } from '../../utils/rowSql/types';
import { MESSAGE_PROJECTION, MESSAGE_JOINS } from './const';

export const selectBefore = (chatId: number, cursor: number | null, limit: number): RowSqlResult => ({
  query: `
    SELECT ${MESSAGE_PROJECTION}
    FROM "public"."message" m
    ${MESSAGE_JOINS}
    WHERE m."chatId" = $1
      AND ($2::int IS NULL OR m.id < $2)
    ORDER BY m.id DESC
    LIMIT $3
  `,
  params: [chatId, cursor, limit + 1],
});

export const selectAfter = (chatId: number, cursor: number | null, limit: number): RowSqlResult => ({
  query: `
    SELECT ${MESSAGE_PROJECTION}
    FROM "public"."message" m
    ${MESSAGE_JOINS}
    WHERE m."chatId" = $1
      AND m.id > $2
    ORDER BY m.id ASC
    LIMIT $3
  `,
  params: [chatId, cursor, limit + 1],
});

export const selectMessageContext = (chatId: number, messageId: number, limit: number = 50): RowSqlResult => ({
  query: `
    WITH target AS (
      SELECT id FROM "public"."message" WHERE "chatId" = $1 AND "id" = $2
    ),
    older AS (
      SELECT ${MESSAGE_PROJECTION}
      FROM "public"."message" m
      ${MESSAGE_JOINS}
      WHERE m."chatId" = $1
        AND m.id <= (SELECT id FROM target)
      ORDER BY m.id DESC
      LIMIT $3
    ),
    newer AS (
      SELECT ${MESSAGE_PROJECTION}
      FROM "public"."message" m
      ${MESSAGE_JOINS}
      WHERE m."chatId" = $1
        AND m.id > (SELECT id FROM target)
      ORDER BY m.id ASC
      LIMIT $4
    )
    SELECT * FROM older
    UNION ALL
    SELECT * FROM newer
    ORDER BY id ASC
  `,
  params: [chatId, messageId, Math.floor(limit / 2) + 2, Math.floor(limit / 2)],
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
            'id',        rm.id,
            'text',      rm.text,
            'userId',    rm."userId",
            'username',  ru.username,
            'createdAt', rm."createdAt"
          )
        ELSE NULL
      END AS reply
    FROM "public"."message" m
    LEFT JOIN "public"."users"   u  ON u.id  = m."userId"
    LEFT JOIN "public"."message" rm ON rm.id = m.reply_id
    LEFT JOIN "public"."users"   ru ON ru.id = rm."userId"
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
