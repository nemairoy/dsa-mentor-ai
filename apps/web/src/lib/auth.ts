import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

import { env } from "@/infrastructure/config/env";

const authPool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 3),
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
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
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
