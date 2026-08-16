import { z } from "zod";
import { AppError } from "@/shared/errors/appError";

export function validateSchema<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const firstIssue = result.error.issues[0];

    throw new AppError(firstIssue?.message ?? "Validation failed", 400, "VALIDATION_ERROR");
  }

  return result.data;
}
