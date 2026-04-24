-- up
ALTER TABLE "public"."message" 
ADD COLUMN "reactions" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- down
ALTER TABLE "public"."message" 
DROP COLUMN IF EXISTS "reactions";
