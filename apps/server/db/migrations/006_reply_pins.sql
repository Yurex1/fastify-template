-- up
ALTER TABLE "public"."message" 
ADD COLUMN "reply_id" INTEGER REFERENCES "public"."message"("id") ON DELETE SET NULL;

CREATE TABLE "public"."chat_pinned_message" (
    "id" SERIAL PRIMARY KEY,
    "chat_id" INTEGER NOT NULL REFERENCES "public"."chats"("id") ON DELETE CASCADE,
    "message_id" INTEGER NOT NULL REFERENCES "public"."message"("id") ON DELETE CASCADE,
    "pinned_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_chat_message_pin" UNIQUE ("chat_id", "message_id")
);

CREATE INDEX "idx_chat_pinned_message_chat_id" ON "public"."chat_pinned_message"("chat_id");

-- down
DROP TABLE IF EXISTS "public"."chat_pinned_message";

ALTER TABLE "public"."message" 
DROP COLUMN IF EXISTS "reply_id";
