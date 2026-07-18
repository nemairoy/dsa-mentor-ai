import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.coerce.boolean().default(true),
  API_BASE_URL: z.string().url().default("http://localhost:8000"),
});

export const env = serverEnvSchema.parse(process.env);

