import { z } from "zod";
import { RoleEnum } from "@/shared/enums/roleEnums";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const userParamsSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(3, "User name must have at least 3 characters").optional(),
    email: z.string().email("Email must be a valid email").optional(),
    role: z.enum([RoleEnum.ADMIN, RoleEnum.AGENT, RoleEnum.USER]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
