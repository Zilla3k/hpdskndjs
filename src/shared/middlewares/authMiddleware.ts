import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";
import { JwtService } from "@/shared/security/jwt";

const jwtService = new JwtService();

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Authorization header is required");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Bearer token is required");
  }

  return token;
}

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = jwtService.verify(token);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
}
