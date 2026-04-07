-- up

CREATE TYPE chat_member_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "chatMember" (
  id SERIAL PRIMARY KEY,
  "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status chat_member_status NOT NULL,
  UNIQUE ("chatId", "userId")
);

CREATE INDEX idx_chat_member_user_status ON "chatMember" ("userId", status);
CREATE INDEX idx_chat_member_chat ON "chatMember" ("chatId");

CREATE TABLE message (
  id SERIAL PRIMARY KEY,
  "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text VARCHAR(511),
  media JSONB,
  "read" BOOLEAN DEFAULT FALSE,
  reference JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_chat_created ON message ("chatId", "createdAt" DESC);

-- down

DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS "chatMember";
DROP TABLE IF EXISTS chats;
DROP TYPE IF EXISTS chat_member_status;
