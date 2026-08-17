import type { ErrorRequestHandler } from "express";
import { AppError } from "@/shared/errors/appError";

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

  if (error.statusCode === 401 || error.code === "UNAUTHORIZED") {
    return "auth";
  }

  return "business";
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
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

  const payload: ErrorResponse = {
    error: {
      category: "internal",
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  };

  res.status(500).json(payload);
};
