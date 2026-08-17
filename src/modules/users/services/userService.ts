import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { buildPaginationMeta, getPagination } from "@/shared/pagination/pagination";
import type { User } from "@/generated/prisma/client";
import { RegisterUserRequest } from "../dto/registerUserRequest";
import { DEFAULT_ROLE } from "@/shared/enums/roleEnums";

type ListUsersRequest = {
  page?: number;
  limit?: number;
};

export class UserService {
  async list(filters: ListUsersRequest = {}) {
    const pagination = getPagination({
      page: filters.page,
      limit: filters.limit,
    });

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(input: RegisterUserRequest, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role ?? DEFAULT_ROLE,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    request: {
      name?: string;
      email?: string;
      role?: User["role"];
    },
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (request.email && request.email !== user.email) {
      const existingUser = await this.findByEmail(request.email);

      if (existingUser && existingUser.id !== id) {
        throw new AppError("User already exists", 409, "USER_ALREADY_EXISTS");
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        name: request.name ?? user.name,
        email: request.email ?? user.email,
        role: request.role ?? user.role,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2003") {
        throw new AppError(
          "User has related records and cannot be deleted",
          409,
          "USER_HAS_DEPENDENCIES",
        );
      }

      throw error;
    }
  }
}
