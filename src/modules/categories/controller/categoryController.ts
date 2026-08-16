import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/shared/errors/appError";
import { validateSchema } from "@/shared/schemas/validateSchemas";
import { CategoryService } from "../services/categoryService";
import {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchemas";

const categoryService = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedBody = validateSchema(createCategorySchema, req.body);
      const result = await categoryService.create(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = validateSchema(categoryParamsSchema, req.params);
      const result = await categoryService.findById(categoryId);

      if (!result) {
        throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = validateSchema(categoryParamsSchema, req.params);
      const parsedBody = validateSchema(updateCategorySchema, req.body);
      const result = await categoryService.update(categoryId, parsedBody);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = validateSchema(categoryParamsSchema, req.params);
      await categoryService.delete(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
