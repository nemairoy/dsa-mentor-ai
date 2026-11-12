-- Better Auth 1.7.15 validates that adapter-managed columns are writable.
-- The adapter does not populate account.issuer during social sign-in, so a
-- required issuer column causes every OAuth request to fail schema validation.
-- Keep existing issuer values, but allow new accounts to omit the column.

ALTER TABLE "account"
ALTER COLUMN "issuer" DROP NOT NULL;
