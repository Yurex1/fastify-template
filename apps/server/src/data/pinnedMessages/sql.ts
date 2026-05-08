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
        'text', m.text,
        'chatId', m."chatId",
        'reply_id', m.reply_id,
        'createdAt', m."createdAt",
        'updatedAt', m."updatedAt",
        'reactions', m.reactions
    ) as "message"
    FROM "public"."chat_pinned_message" pm
    JOIN "public"."message" m ON pm.message_id = m.id
    WHERE pm.chat_id = $1
    ORDER BY m."createdAt" ASC
    LIMIT $2 OFFSET $3;
  `,
  params: [chatId, limit, offset],
});

export const deleteByChatAndMessage = (chatId: number, messageId: number) => ({
  query: `
    DELETE FROM "chat_pinned_message"
    WHERE chat_id = $1 AND message_id = $2
    RETURNING chat_id, message_id
  `,
  params: [chatId, messageId],
});
