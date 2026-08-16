import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/shared/errors/appError";
import { validateSchema } from "@/shared/schemas/validateSchemas";
import { PriorityService } from "../services/priorityService";
import {
  createPrioritySchema,
  priorityParamsSchema,
  updatePrioritySchema,
} from "../schemas/prioritySchemas";

const priorityService = new PriorityService();

export class PriorityController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedBody = validateSchema(createPrioritySchema, req.body);
      const result = await priorityService.create(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await priorityService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priorityId } = validateSchema(priorityParamsSchema, req.params);
      const result = await priorityService.findById(priorityId);

      if (!result) {
        throw new AppError("Priority not found", 404, "PRIORITY_NOT_FOUND");
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priorityId } = validateSchema(priorityParamsSchema, req.params);
      const parsedBody = validateSchema(updatePrioritySchema, req.body);
      const result = await priorityService.update(priorityId, parsedBody);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priorityId } = validateSchema(priorityParamsSchema, req.params);
      await priorityService.delete(priorityId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
