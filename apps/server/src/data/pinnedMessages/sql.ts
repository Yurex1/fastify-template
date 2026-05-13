import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByChatId = (chatId: number, offset: number = 0, limit: number = 30): RowSqlResult => ({
  query: `
   SELECT 
    pm.id as "id",
    pm.chat_id as "chat_id",
    pm.message_id as "message_id",
    pm.pinned_at as "pinned_at",
    json_build_object(
        'id', m.id,
        'userId', m."userId",
        'username', u.username,
        'text', m.text,
        'chatId', m."chatId",
        'createdAt', m."createdAt",
        'updatedAt', m."updatedAt",
        'reactions', m.reactions,
        'reply', CASE 
            WHEN m.reply_id IS NOT NULL THEN 
              json_build_object(
                'id', rm.id,
                'text', rm.text,
                'userId', rm."userId",
                'username', ru.username,
                'createdAt', rm."createdAt"
              )
            ELSE NULL 
          END
    ) as "message"
    FROM "public"."chat_pinned_message" pm
    JOIN "public"."message" m ON pm.message_id = m.id
    LEFT JOIN "public"."users" u ON m."userId" = u.id
    LEFT JOIN "public"."message" rm ON m.reply_id = rm.id
    LEFT JOIN "public"."users" ru ON rm."userId" = ru.id
    WHERE pm.chat_id = $1
    ORDER BY m."createdAt" DESC
    LIMIT $2 OFFSET $3;
  `,
  params: [chatId, limit, offset],
});

export const deleteByChatAndMessage = (chatId: number, messageId: number): RowSqlResult => ({
  query: `
    DELETE FROM "chat_pinned_message"
    WHERE chat_id = $1 AND message_id = $2
    RETURNING chat_id, message_id
  `,
  params: [chatId, messageId],
});

export const selectPinnedStats = (chatId: number): RowSqlResult => ({
  query: `
    SELECT 
      COUNT(*) OVER()::int AS total_count,
      m."text",
      p.* 
    FROM "public"."chat_pinned_message" p
    INNER JOIN "public"."message" m ON m."id" = p."message_id"
    WHERE p."chat_id" = $1
    ORDER BY m."createdAt" DESC
    LIMIT 1
  `,
  params: [chatId],
});
