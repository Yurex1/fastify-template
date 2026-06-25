-- up
CREATE TABLE device_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id  VARCHAR(255) NOT NULL,
  token      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);

-- down
DROP INDEX IF EXISTS idx_device_tokens_user_id;
DROP TABLE IF EXISTS device_tokens;
