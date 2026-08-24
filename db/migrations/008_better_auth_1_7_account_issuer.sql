-- Better Auth 1.7 scopes external account identities by issuer + accountId.
-- This application only enables the Google social provider.

ALTER TABLE "account"
ADD COLUMN IF NOT EXISTS "issuer" TEXT;

UPDATE "account"
SET "issuer" = 'https://accounts.google.com'
WHERE "providerId" = 'google'
  AND "issuer" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "account" WHERE "issuer" IS NULL) THEN
        RAISE EXCEPTION 'Cannot finish Better Auth 1.7 migration: unmapped account issuer';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "account"
        GROUP BY "issuer", "accountId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot finish Better Auth 1.7 migration: duplicate issuer/accountId identity';
    END IF;
END $$;

ALTER TABLE "account"
ALTER COLUMN "issuer" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "account_issuer_accountId_uidx"
ON "account"("issuer", "accountId");
