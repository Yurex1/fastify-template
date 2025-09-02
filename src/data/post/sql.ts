import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByCategory = (category: string): RowSqlResult => ({
  query: `
    SELECT "id", "title", "body", "category", "userId", "photo", "createdAt", "updatedAt"
    FROM "public"."posts"
    WHERE "category" = $1
    ORDER BY "createdAt" DESC;
  `,
  params: [category],
});

export const selectByUserId = (userId: number): RowSqlResult => ({
  query: `
    SELECT "id", "title", "body", "category", "userId", "photo", "createdAt", "updatedAt"
    FROM "public"."posts"
    WHERE "userId" = $1
    ORDER BY "createdAt" DESC;
  `,
  params: [userId],
});
