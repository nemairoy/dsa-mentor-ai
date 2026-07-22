import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

import { env } from "@/infrastructure/config/env";

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
  database: new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PG_POOL_MAX ?? 3),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  }),
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
