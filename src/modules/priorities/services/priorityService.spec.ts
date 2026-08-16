import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { PriorityService } from "./priorityService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    priority: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  priority: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe("PriorityService", () => {
  const service = new PriorityService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a priority when it does not already exist", async () => {
      mockPrisma.priority.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      mockPrisma.priority.create.mockResolvedValue({
        id: "priority-1",
        name: "High",
        level: 1,
        description: "High priority",
      });

      const result = await service.create({
        name: "High",
        level: 1,
        description: "High priority",
      });

      expect(mockPrisma.priority.findUnique).toHaveBeenNthCalledWith(1, {
        where: { name: "High" },
      });
      expect(mockPrisma.priority.findUnique).toHaveBeenNthCalledWith(2, {
        where: { level: 1 },
      });
      expect(mockPrisma.priority.create).toHaveBeenCalledWith({
        data: {
          name: "High",
          level: 1,
          description: "High priority",
        },
      });
      expect(result).toEqual({
        id: "priority-1",
        name: "High",
        level: 1,
        description: "High priority",
      });
    });

    it("should throw when priority name already exists", async () => {
      mockPrisma.priority.findUnique.mockResolvedValueOnce({
        id: "priority-1",
        name: "High",
      });

      await expect(
        service.create({
          name: "High",
          level: 1,
          description: "High priority",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw when priority level already exists", async () => {
      mockPrisma.priority.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: "priority-1",
        level: 1,
      });

      await expect(
        service.create({
          name: "High",
          level: 1,
          description: "High priority",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("list", () => {
    it("should list priorities ordered by level", async () => {
      mockPrisma.priority.findMany.mockResolvedValue([
        { id: "priority-1", name: "High", level: 1 },
        { id: "priority-2", name: "Low", level: 3 },
      ]);

      const result = await service.list();

      expect(mockPrisma.priority.findMany).toHaveBeenCalledWith({
        orderBy: { level: "asc" },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("should find a priority by id", async () => {
      mockPrisma.priority.findUnique.mockResolvedValue({
        id: "priority-1",
        name: "High",
        level: 1,
      });

      const result = await service.findById("priority-1");

      expect(mockPrisma.priority.findUnique).toHaveBeenCalledWith({
        where: { id: "priority-1" },
      });
      expect(result).toEqual({
        id: "priority-1",
        name: "High",
        level: 1,
      });
    });
  });

  describe("update", () => {
    it("should update a priority", async () => {
      mockPrisma.priority.findUnique
        .mockResolvedValueOnce({
          id: "priority-1",
          name: "High",
          level: 1,
          description: "High priority",
        })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrisma.priority.update.mockResolvedValue({
        id: "priority-1",
        name: "Urgent",
        level: 1,
        description: "Urgent priority",
      });

      const result = await service.update("priority-1", {
        name: "Urgent",
        description: "Urgent priority",
      });

      expect(mockPrisma.priority.update).toHaveBeenCalledWith({
        where: { id: "priority-1" },
        data: {
          name: "Urgent",
          level: 1,
          description: "Urgent priority",
        },
      });
      expect(result).toEqual({
        id: "priority-1",
        name: "Urgent",
        level: 1,
        description: "Urgent priority",
      });
    });

    it("should throw when priority does not exist", async () => {
      mockPrisma.priority.findUnique.mockResolvedValue(null);

      await expect(
        service.update("missing-priority", {
          name: "Urgent",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("delete", () => {
    it("should delete a priority", async () => {
      mockPrisma.priority.findUnique.mockResolvedValue({
        id: "priority-1",
        name: "High",
        level: 1,
      });
      mockPrisma.priority.delete.mockResolvedValue({
        id: "priority-1",
        name: "High",
        level: 1,
      });

      const result = await service.delete("priority-1");

      expect(mockPrisma.priority.delete).toHaveBeenCalledWith({
        where: { id: "priority-1" },
      });
      expect(result).toEqual({
        id: "priority-1",
        name: "High",
        level: 1,
      });
    });

    it("should throw when priority does not exist", async () => {
      mockPrisma.priority.findUnique.mockResolvedValue(null);

      await expect(service.delete("missing-priority")).rejects.toBeInstanceOf(AppError);
    });
  });
});
