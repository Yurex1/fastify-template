import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByUserIdAndChatId = (userId: number, chatId: number): RowSqlResult => ({
  query: `
    SELECT "id", "text", "userId", "chatId", "createdAt", "updatedAt"
    FROM "public"."message"
    WHERE "userId" = $1 AND "chatId" = $2
    ORDER BY "createdAt" ASC;
  `,
  params: [userId, chatId],
});
