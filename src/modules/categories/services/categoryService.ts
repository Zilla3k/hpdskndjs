import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";

type CreateCategoryRequest = {
  name: string;
  description?: string;
};

type UpdateCategoryRequest = {
  name?: string;
  description?: string;
};

export class CategoryService {
  async create(request: CreateCategoryRequest) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: request.name },
    });

    if (existingCategory) {
      throw new AppError("Category already exists", 409, "CATEGORY_ALREADY_EXISTS");
    }

    return prisma.category.create({
      data: {
        name: request.name,
        description: request.description,
      },
    });
  }

  async list() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async update(id: string, request: UpdateCategoryRequest) {
    const category = await this.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    if (request.name && request.name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: request.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new AppError("Category already exists", 409, "CATEGORY_ALREADY_EXISTS");
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        name: request.name ?? category.name,
        description: request.description ?? category.description,
      },
    });
  }

  async delete(id: string) {
    const category = await this.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    return prisma.category.delete({
      where: { id },
    });
  }
}
