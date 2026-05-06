-- up

CREATE TABLE IF EXISTS users (
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

-- down

DROP TRIGGER IF EXISTS update_post_timestamp ON posts;
DROP TABLE IF EXISTS posts;
DROP TRIGGER IF EXISTS update_user_timestamp ON users;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS update_timestamp();
