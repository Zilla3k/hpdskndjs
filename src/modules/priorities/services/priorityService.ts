import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";

type CreatePriorityRequest = {
  name: string;
  level: number;
  description?: string;
};

type UpdatePriorityRequest = {
  name?: string;
  level?: number;
  description?: string;
};

export class PriorityService {
  async create(request: CreatePriorityRequest) {
    const existingByName = await prisma.priority.findUnique({
      where: { name: request.name },
    });

    if (existingByName) {
      throw new AppError("Priority already exists", 409, "PRIORITY_ALREADY_EXISTS");
    }

    const existingByLevel = await prisma.priority.findUnique({
      where: { level: request.level },
    });

    if (existingByLevel) {
      throw new AppError("Priority level already exists", 409, "PRIORITY_LEVEL_ALREADY_EXISTS");
    }

    return prisma.priority.create({
      data: {
        name: request.name,
        level: request.level,
        description: request.description,
      },
    });
  }

  async list() {
    return prisma.priority.findMany({
      orderBy: { level: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.priority.findUnique({
      where: { id },
    });
  }

  async update(id: string, request: UpdatePriorityRequest) {
    const priority = await this.findById(id);

    if (!priority) {
      throw new AppError("Priority not found", 404, "PRIORITY_NOT_FOUND");
    }

    if (request.name && request.name !== priority.name) {
      const existingByName = await prisma.priority.findUnique({
        where: { name: request.name },
      });

      if (existingByName && existingByName.id !== id) {
        throw new AppError("Priority already exists", 409, "PRIORITY_ALREADY_EXISTS");
      }
    }

    if (request.level && request.level !== priority.level) {
      const existingByLevel = await prisma.priority.findUnique({
        where: { level: request.level },
      });

      if (existingByLevel && existingByLevel.id !== id) {
        throw new AppError("Priority level already exists", 409, "PRIORITY_LEVEL_ALREADY_EXISTS");
      }
    }

    return prisma.priority.update({
      where: { id },
      data: {
        name: request.name ?? priority.name,
        level: request.level ?? priority.level,
        description: request.description ?? priority.description,
      },
    });
  }

  async delete(id: string) {
    const priority = await this.findById(id);

    if (!priority) {
      throw new AppError("Priority not found", 404, "PRIORITY_NOT_FOUND");
    }

    return prisma.priority.delete({
      where: { id },
    });
  }
}
