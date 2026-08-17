import { AppError } from "@/shared/errors/appError";
import { ForbiddenError } from "@/shared/errors/forbiddenError";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";
import { logger } from "@/shared/logger/logger";
import { errorMiddleware } from "./errorMiddleware";

describe("errorMiddleware", () => {
  const createResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    return res;
  };

  it("should return a validation error response", () => {
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const req = {};
    const res = createResponse();

    errorMiddleware(
      new AppError("Invalid input", 400, "VALIDATION_ERROR"),
      req as never,
      res as never,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "validation",
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      },
    });
    expect(logSpy).toHaveBeenCalledWith("Application error", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid input",
    });
    logSpy.mockRestore();
  });

  it("should return an auth error response", () => {
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const req = {};
    const res = createResponse();

    errorMiddleware(new UnauthorizedError(), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "auth",
        code: "UNAUTHORIZED",
        message: "Credentials Invalid",
      },
    });
    expect(logSpy).toHaveBeenCalledWith("Application error", {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Credentials Invalid",
    });
    logSpy.mockRestore();
  });

  it("should return an auth error response for forbidden errors", () => {
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const req = {};
    const res = createResponse();

    errorMiddleware(new ForbiddenError(), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "auth",
        code: "FORBIDDEN",
        message: "Forbidden",
      },
    });
    expect(logSpy).toHaveBeenCalledWith("Application error", {
      statusCode: 403,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
    logSpy.mockRestore();
  });

  it("should return a business error response", () => {
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const req = {};
    const res = createResponse();

    errorMiddleware(
      new AppError("Category not found", 404, "CATEGORY_NOT_FOUND"),
      req as never,
      res as never,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "business",
        code: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      },
    });
    expect(logSpy).toHaveBeenCalledWith("Application error", {
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
      message: "Category not found",
    });
    logSpy.mockRestore();
  });

  it("should return an internal server error response for unknown errors", () => {
    const logSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
    const req = {};
    const res = createResponse();

    errorMiddleware(new Error("Unexpected error"), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "internal",
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    });
    expect(logSpy).toHaveBeenCalledWith("Unhandled error", {
      message: "Unexpected error",
    });
    logSpy.mockRestore();
  });
});
