import type { RowSqlResult } from '../../utils/rowSql/types';
import { PinnedMessagesCursor } from './types';

export const selectByChatId = (
  chatId: number,
  cursor: PinnedMessagesCursor | null = null,
  limit: number = 30,
): RowSqlResult => ({
  query: `
    SELECT
      (
        SELECT COUNT(*)::int
        FROM "public"."chat_pinned_message"
        WHERE "chat_id" = $1
      ) AS "totalCount",
      COALESCE(json_agg(t), '[]'::json) AS "data"
    FROM (
      SELECT
        pm.id,
        pm.chat_id,
        pm.message_id,
        pm.pinned_at,
        json_build_object(
          'id',        m.id,
          'userId',    m."userId",
          'username',  u.username,
          'text',      m.text,
          'chatId',    m."chatId",
          'createdAt', m."createdAt",
          'updatedAt', m."updatedAt",
          'reactions', m.reactions,
          'reply', CASE
            WHEN m.reply_id IS NOT NULL THEN
              json_build_object(
                'id',        rm.id,
                'text',      rm.text,
                'userId',    rm."userId",
                'username',  ru.username,
                'createdAt', rm."createdAt"
              )
            ELSE NULL
          END
        ) AS "message"
      FROM "public"."chat_pinned_message" pm
      JOIN  "public"."message" m  ON pm.message_id = m.id
      LEFT JOIN "public"."users" u  ON m."userId"   = u.id
      LEFT JOIN "public"."message" rm ON m.reply_id  = rm.id
      LEFT JOIN "public"."users" ru ON rm."userId"  = ru.id
      WHERE pm.chat_id = $1
        AND (
          $2::timestamptz IS NULL
          OR (m."createdAt", pm.id) < ($2::timestamptz, $3::int)
        )
      ORDER BY m."createdAt" DESC, pm.id DESC
      LIMIT $4
    ) t
  `,
  params: [chatId, cursor?.createdAt ?? null, cursor?.id ?? null, limit + 1],
});

export const deleteByChatAndMessage = (chatId: number, messageId: number): RowSqlResult => ({
  query: `
    DELETE FROM "chat_pinned_message"
    WHERE chat_id = $1 AND message_id = $2
    RETURNING chat_id, message_id
  `,
  params: [chatId, messageId],
});
