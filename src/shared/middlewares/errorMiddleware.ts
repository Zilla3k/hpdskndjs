import type { ErrorRequestHandler } from "express";
import { AppError } from "@/shared/errors/appError";
import { logger } from "@/shared/logger/logger";

type ErrorCategory = "validation" | "auth" | "business" | "internal";

type ErrorResponse = {
  error: {
    category: ErrorCategory;
    code: string;
    message: string;
  };
};

function getErrorCategory(error: AppError): ErrorCategory {
  if (error.code === "VALIDATION_ERROR") {
    return "validation";
  }

  if (
    error.statusCode === 401 ||
    error.statusCode === 403 ||
    error.code === "UNAUTHORIZED" ||
    error.code === "FORBIDDEN"
  ) {
    return "auth";
  }

  return "business";
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    logger.error("Application error", {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    });

    const payload: ErrorResponse = {
      error: {
        category: getErrorCategory(error),
        code: error.code,
        message: error.message,
      },
    };

    res.status(error.statusCode).json(payload);
    return;
  }

  logger.error("Unhandled error", {
    message: error instanceof Error ? error.message : "Unknown error",
  });

  const payload: ErrorResponse = {
    error: {
      category: "internal",
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  };

  res.status(500).json(payload);
};
