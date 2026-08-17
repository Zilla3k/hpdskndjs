import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/shared/errors/appError";
import { validateSchema } from "@/shared/schemas/validateSchemas";
import { listUsersQuerySchema, updateUserSchema, userParamsSchema } from "../schemas/userSchemas";
import { UserService } from "../services/userService";

const userService = new UserService();

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = validateSchema(listUsersQuerySchema, _req.query);
      const result = await userService.list(parsedQuery);

      res.status(200).json({
        data: result.data.map(mapUser),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = validateSchema(userParamsSchema, req.params);
      const user = await userService.findById(userId);

      if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      res.status(200).json(mapUser(user));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = validateSchema(userParamsSchema, req.params);
      const parsedBody = validateSchema(updateUserSchema, req.body);
      const user = await userService.update(userId, parsedBody);

      res.status(200).json(mapUser(user));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = validateSchema(userParamsSchema, req.params);
      await userService.delete(userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
