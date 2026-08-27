import { z } from "zod";

const booleanEnv = z.enum(["true", "false"]).default("true").transform((value) => value === "true");

const serverEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: booleanEnv,
  DATABASE_SSL_VERIFY: booleanEnv,
  DATABASE_POOLER_HOST: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  DATABASE_POOLER_PORT: z.coerce.number().int().positive().default(5432),
  API_BASE_URL: z.string().url().default("http://localhost:8000"),
});

export const env = serverEnvSchema.parse(process.env);
