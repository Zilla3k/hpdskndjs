import type { NextFunction, Request, Response } from "express";
import { validateSchema } from "@/shared/schemas/validateSchemas";
import { dashboardPeriodQuerySchema } from "../schemas/dashboardSchemas";
import { DashboardService } from "../services/dashboardService";

const dashboardService = new DashboardService();

export class DashboardController {
  async overview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dashboardService.getOverview();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async byStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dashboardService.getStatusSummary();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async byPriorities(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dashboardService.getPrioritySummary();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async byPeriod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = validateSchema(dashboardPeriodQuerySchema, req.query);
      const result = await dashboardService.getPeriodSummary(parsedQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
