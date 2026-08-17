import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "@/shared/errors/forbiddenError";
import type { Role } from "@/shared/enums/roleEnums";

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const currentRole = req.user?.role;

    if (!currentRole) {
      next(new ForbiddenError("User role is missing"));
      return;
    }

    if (!allowedRoles.includes(currentRole)) {
      next(new ForbiddenError("You do not have permission to access this resource"));
      return;
    }

    next();
  };
}
