import { AppError } from "./appError";

export class UnauthorizedError extends AppError {
  constructor(message = "Credentials Invalid", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}
