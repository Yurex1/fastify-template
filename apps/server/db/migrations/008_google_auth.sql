-- up
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_googleid ON "public"."users"("googleId");

-- down
ALTER TABLE "public"."users" 
DROP COLUMN IF EXISTS "googleId";

DROP INDEX IF EXISTS idx_users_googleid;