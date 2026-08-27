CREATE TABLE IF NOT EXISTS api_rate_limit (
    key TEXT NOT NULL,
    "windowStart" TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    "expiresAt" TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (key, "windowStart")
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limit_expires_at
ON api_rate_limit ("expiresAt");

ALTER TABLE api_rate_limit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE api_rate_limit FROM anon, authenticated;
