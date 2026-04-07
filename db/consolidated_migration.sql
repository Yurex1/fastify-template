-- One-shot schema for a fresh database (not run by db/migrate.ts — use for manual setup or docs).
-- For incremental changes, use files under db/migrations/ and `npm run migrate:up`.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

ALTER TABLE users ADD COLUMN password VARCHAR NOT NULL;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_userId ON posts("userId");
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_createdAt ON posts("createdAt");

CREATE TRIGGER update_post_timestamp
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

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
