ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
UPDATE "user" SET "role" = 'user' WHERE "role" IS NULL;
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "account_providerId_accountId_key" ON "account" USING btree ("providerId","accountId");
