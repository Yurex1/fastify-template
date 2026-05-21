-- up

CREATE INDEX idx_message_chat_id ON message ("chatId", id);
CREATE INDEX idx_chats_updated_at_id ON chats ("updatedAt" DESC, id DESC);

-- down

DROP INDEX IF EXISTS idx_message_chat_id;
DROP INDEX IF EXISTS idx_chats_updated_at_id;