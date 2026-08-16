import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { CategoryService } from "./categoryService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  category: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe("CategoryService", () => {
  const service = new CategoryService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a category when it does not already exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue({
        id: "category-1",
        name: "Support",
        description: "Support related issues",
      });

      const result = await service.create({
        name: "Support",
        description: "Support related issues",
      });

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: "Support" },
      });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Support",
          description: "Support related issues",
        },
      });
      expect(result).toEqual({
        id: "category-1",
        name: "Support",
        description: "Support related issues",
      });
    });

    it("should throw when category already exists", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "category-1",
        name: "Support",
      });

      await expect(
        service.create({
          name: "Support",
          description: "Support related issues",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("list", () => {
    it("should list categories ordered by name", async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: "category-1", name: "Billing" },
        { id: "category-2", name: "Support" },
      ]);

      const result = await service.list();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("should find a category by id", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "category-1",
        name: "Support",
      });

      const result = await service.findById("category-1");

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "category-1" },
      });
      expect(result).toEqual({
        id: "category-1",
        name: "Support",
      });
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce({
          id: "category-1",
          name: "Support",
          description: "Support related issues",
        })
        .mockResolvedValueOnce(null);

      mockPrisma.category.update.mockResolvedValue({
        id: "category-1",
        name: "Customer Support",
        description: "Customer related issues",
      });

      const result = await service.update("category-1", {
        name: "Customer Support",
        description: "Customer related issues",
      });

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "category-1" },
        data: {
          name: "Customer Support",
          description: "Customer related issues",
        },
      });
      expect(result).toEqual({
        id: "category-1",
        name: "Customer Support",
        description: "Customer related issues",
      });
    });

    it("should throw when category does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update("missing-category", {
          name: "Customer Support",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("delete", () => {
    it("should delete a category", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "category-1",
        name: "Support",
      });
      mockPrisma.category.delete.mockResolvedValue({
        id: "category-1",
        name: "Support",
      });

      const result = await service.delete("category-1");

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: "category-1" },
      });
      expect(result).toEqual({
        id: "category-1",
        name: "Support",
      });
    });

    it("should throw when category does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.delete("missing-category")).rejects.toBeInstanceOf(AppError);
    });
  });
});
