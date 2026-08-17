import type { NextFunction, Request, Response } from "express";
import { logger } from "@/shared/logger/logger";

function getRequestPath(req: Request): string {
  return `${req.baseUrl}${req.path}`;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      method: req.method,
      path: getRequestPath(req),
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      query: req.query,
    });
  });

  next();
}
