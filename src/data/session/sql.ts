import { CreateSession } from '../../entities/session';
import type { RowSqlResult } from '../../utils/rowSql/types';

export const selectByUserId = (userId: number): RowSqlResult => ({
  query: `
   SELECT "id", 
      "userId", 
      "refreshToken", 
      "expiresAt", 
      "deviceId", 
      "createdAt", 
      "updatedAt"
    FROM "public"."sessions"
    WHERE "userId" = $1
    ORDER BY "expiresAt" DESC;
  `,
  params: [userId],
});

export const buildUpsertQuery = (session: CreateSession): RowSqlResult => ({
  query: `
      INSERT INTO sessions ("userId", "deviceId", "refreshToken", "expiresAt")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("userId", "deviceId")
      DO UPDATE SET 
        "refreshToken" = $3,
        "expiresAt" = $4,
        "updatedAt" = NOW()
      RETURNING *;
    `,
  params: [session.userId, session.deviceId, session.refreshToken, session.expiresAt],
});

export const removeByUserIdAndDeviceId = (userId: number, deviceId: string): RowSqlResult => ({
  query: `
  DELETE FROM sessions WHERE "userId" = $1 AND "deviceId" = $2
  `,
  params: [userId, deviceId],
});
