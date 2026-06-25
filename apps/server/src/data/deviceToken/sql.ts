import type { RowSqlResult } from '../../utils/rowSql/types';

export const upsertDeviceToken = (data: { userId: number; deviceId: string; token: string }): RowSqlResult => ({
  query: `
    INSERT INTO "public"."device_tokens"
    ("user_id", "device_id", "token", "updated_at")
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("user_id", "device_id")
    DO UPDATE SET
      "token" = EXCLUDED."token",
      "updated_at" = EXCLUDED."updated_at"
    RETURNING *
  `,
  params: [data.userId, data.deviceId, data.token, new Date()],
});

export const selectByUserId = (userId: number): RowSqlResult => ({
  query: `
    SELECT *
    FROM "public"."device_tokens"
    WHERE "user_id" = $1
  `,
  params: [userId],
});

export const deleteByUserAndDevice = (userId: number, deviceId: string): RowSqlResult => ({
  query: `
    DELETE FROM "public"."device_tokens"
    WHERE "user_id" = $1 AND "device_id" = $2
  `,
  params: [userId, deviceId],
});

export const deleteByToken = (token: string): RowSqlResult => ({
  query: `
    DELETE FROM "public"."device_tokens"
    WHERE "token" = $1
  `,
  params: [token],
});
