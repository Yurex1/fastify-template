import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByToken = (token: string): RowSqlResult => ({
  query: `
    SELECT "id", "userId", "refreshToken", "expiresAt" 
    FROM "public"."sessions"
    WHERE "refreshToken" = $1
    ORDER BY "expiresAt" DESC;
  `,
  params: [token],
});

export const selectByUserId = (userId: number): RowSqlResult => ({
  query: `
   SELECT "id", "userId", "refreshToken", "expiresAt" 
    FROM "public"."sessions"
    WHERE "userId" = $1
    ORDER BY "expiresAt" DESC;
  `,
  params: [userId],
});
