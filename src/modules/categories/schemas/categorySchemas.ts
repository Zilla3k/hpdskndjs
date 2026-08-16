import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Category name must have at least 3 characters"),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(3, "Category name must have at least 3 characters").optional(),
  description: z.string().optional(),
});

export const categoryParamsSchema = z.object({
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
});
