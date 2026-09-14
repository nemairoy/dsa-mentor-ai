import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

type ParsedJson<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export async function parseJsonRequest<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
  detail = "The request body is invalid",
): Promise<ParsedJson<z.infer<TSchema>>> {
  const input = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json({ detail }, { status: 400 }),
    };
  }

  return { success: true, data: parsed.data };
}
