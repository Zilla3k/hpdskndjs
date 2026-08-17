import { AppError } from "@/shared/errors/appError";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";
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
    const req = {};
    const res = createResponse();

    errorMiddleware(new AppError("Invalid input", 400, "VALIDATION_ERROR"), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "validation",
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      },
    });
  });

  it("should return an auth error response", () => {
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
  });

  it("should return a business error response", () => {
    const req = {};
    const res = createResponse();

    errorMiddleware(new AppError("Category not found", 404, "CATEGORY_NOT_FOUND"), req as never, res as never, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        category: "business",
        code: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      },
    });
  });

  it("should return an internal server error response for unknown errors", () => {
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
  });
});
