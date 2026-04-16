import type { RowSqlResult } from '../../utils/rowSql/types';
import { ChatMemberStatus } from '../chatMember/types';

export const selectByChatId = (chatId: number, offset: number = 0, limit: number = 30): RowSqlResult => ({
  query: `
    SELECT 
      m.id, 
      m."userId", 
      m."text", 
      m."chatId", 
      m."createdAt", 
      m."updatedAt"
    FROM "public"."message" m
    WHERE m."chatId" = $1
    ORDER BY m."createdAt" DESC 
    LIMIT $2 OFFSET $3
  `,
  params: [chatId, limit, offset],
});
