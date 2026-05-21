export const MESSAGE_PROJECTION = `
  m.id,
  m."userId",
  u.username,
  m."text",
  m."reactions",
  m."chatId",
  m."createdAt",
  m."updatedAt",
  m."read",
  m."reply_id",
  CASE
    WHEN m."reply_id" IS NOT NULL THEN
      json_build_object(
        'id',        rm.id,
        'text',      rm.text,
        'userId',    rm."userId",
        'username',  ru.username,
        'createdAt', rm."createdAt"
      )
    ELSE NULL
  END AS "reply",
  CASE
    WHEN pm.id IS NOT NULL THEN true
    ELSE false
  END AS "isPinned"
`;

export const MESSAGE_JOINS = `
  LEFT JOIN "public"."users"               u  ON u.id  = m."userId"
  LEFT JOIN "public"."message"             rm ON rm.id = m."reply_id"
  LEFT JOIN "public"."users"               ru ON ru.id = rm."userId"
  LEFT JOIN "public"."chat_pinned_message" pm ON pm.message_id = m.id AND pm.chat_id = $1
`;
