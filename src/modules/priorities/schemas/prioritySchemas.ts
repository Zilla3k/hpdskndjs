import { z } from "zod";

export const createPrioritySchema = z.object({
  name: z.string().min(3, "Priority name must have at least 3 characters"),
  level: z.number().int().positive("Priority level must be a positive integer"),
  description: z.string().optional(),
});

export const updatePrioritySchema = z.object({
  name: z.string().min(3, "Priority name must have at least 3 characters").optional(),
  level: z.number().int().positive("Priority level must be a positive integer").optional(),
  description: z.string().optional(),
});

export const priorityParamsSchema = z.object({
  priorityId: z.string().uuid("Priority ID must be a valid UUID"),
});
