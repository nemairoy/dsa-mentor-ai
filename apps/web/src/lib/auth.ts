import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

import { env } from "@/infrastructure/config/env";
import { resolvedDatabaseUrl } from "@/infrastructure/database/database-url";

const authPool = new Pool({
  connectionString: resolvedDatabaseUrl(),
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: env.DATABASE_SSL_VERIFY } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 3),
  connectionTimeoutMillis: 3_000,
  idleTimeoutMillis: 10_000,
  statement_timeout: 5_000,
  query_timeout: 5_000,
});

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "127.0.0.1:3000",
      "dsamentor-ai.vercel.app",
      "*.vercel.app",
    ],
    fallback: env.BETTER_AUTH_URL,
    protocol: "auto",
  },
  database: authPool,
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  databaseHooks: {
    session: {
      create: {
        async after(session) {
          try {
            await authPool.query(
              `DELETE FROM "session"
               WHERE "userId" = $1
                 AND "token" <> $2
                 AND "createdAt" <= $3`,
              [session.userId, session.token, session.createdAt],
            );
          } catch (error) {
            console.error("[auth] Failed to revoke older sessions", error);
          }
        },
      },
    },
  },
  trustedOrigins: Array.from(new Set([env.NEXT_PUBLIC_APP_URL, env.BETTER_AUTH_URL])),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [admin({ bannedUserMessage: "This account has been blocked. Please contact the administrator." }), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
