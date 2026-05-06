import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByChatId = (chatId: number, offset: number = 0, limit: number = 30): RowSqlResult => ({
  query: `
    SELECT 
      m.id, 
      m."userId", 
      m."text", 
      m."reactions",
      m."chatId", 
      m."createdAt", 
      m."updatedAt",
      m."read"
    FROM "public"."message" m
    WHERE m."chatId" = $1
    ORDER BY m."createdAt" DESC 
    LIMIT $2 OFFSET $3
  `,
  params: [chatId, limit, offset],
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
