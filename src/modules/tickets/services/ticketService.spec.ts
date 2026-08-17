import { TicketHistoryAction, TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { TicketService } from "./ticketService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    category: {
      findUnique: jest.fn(),
    },
    priority: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    ticketHistory: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  category: {
    findUnique: jest.Mock;
  };
  priority: {
    findUnique: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
  };
  ticket: {
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };
  $transaction: jest.Mock;
  ticketHistory: {
    create: jest.Mock;
  };
};

describe("TicketService", () => {
  const service = new TicketService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a ticket and history", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: "category-1" });
      mockPrisma.priority.findUnique.mockResolvedValue({ id: "priority-1" });
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
      mockPrisma.ticket.create.mockResolvedValue({
        id: "ticket-1",
        title: "Need support",
        description: "My app is broken",
        categoryId: "category-1",
        priorityId: "priority-1",
        createdById: "user-1",
      });
      mockPrisma.ticketHistory.create.mockResolvedValue({ id: "history-1" });

      const result = await service.create({
        title: "Need support",
        description: "My app is broken",
        categoryId: "category-1",
        priorityId: "priority-1",
        createdById: "user-1",
      });

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "category-1" },
      });
      expect(mockPrisma.priority.findUnique).toHaveBeenCalledWith({
        where: { id: "priority-1" },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: {
          title: "Need support",
          description: "My app is broken",
          categoryId: "category-1",
          priorityId: "priority-1",
          createdById: "user-1",
        },
      });
      expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
        data: {
          ticketId: "ticket-1",
          changedById: "user-1",
          action: TicketHistoryAction.CREATED,
          field: "ticket",
          oldValue: null,
          newValue: "Need support",
        },
      });
      expect(result).toEqual({
        id: "ticket-1",
        title: "Need support",
        description: "My app is broken",
        categoryId: "category-1",
        priorityId: "priority-1",
        createdById: "user-1",
      });
    });

    it("should throw when category does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.priority.findUnique.mockResolvedValue({ id: "priority-1" });
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });

      await expect(
        service.create({
          title: "Need support",
          description: "My app is broken",
          categoryId: "missing-category",
          priorityId: "priority-1",
          createdById: "user-1",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw when priority does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: "category-1" });
      mockPrisma.priority.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });

      await expect(
        service.create({
          title: "Need support",
          description: "My app is broken",
          categoryId: "category-1",
          priorityId: "missing-priority",
          createdById: "user-1",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw when creator does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: "category-1" });
      mockPrisma.priority.findUnique.mockResolvedValue({ id: "priority-1" });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: "Need support",
          description: "My app is broken",
          categoryId: "category-1",
          priorityId: "priority-1",
          createdById: "missing-user",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("list", () => {
    it("should list tickets with filters and pagination", async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([
        {
          id: "ticket-1",
          title: "Need support",
          status: TicketStatus.OPEN,
        },
      ]);
      mockPrisma.ticket.count.mockResolvedValue(1);

      const result = await service.list({
        status: TicketStatus.OPEN,
        categoryId: "category-1",
        priorityId: "priority-1",
        createdById: "user-1",
        assignedToId: "agent-1",
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          status: TicketStatus.OPEN,
          categoryId: "category-1",
          priorityId: "priority-1",
          createdById: "user-1",
          assignedToId: "agent-1",
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 0,
        take: 20,
      });
      expect(mockPrisma.ticket.count).toHaveBeenCalledWith({
        where: {
          status: TicketStatus.OPEN,
          categoryId: "category-1",
          priorityId: "priority-1",
          createdById: "user-1",
          assignedToId: "agent-1",
        },
      });
      expect(result).toEqual({
        data: [
          {
            id: "ticket-1",
            title: "Need support",
            status: TicketStatus.OPEN,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          skip: 0,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it("should sort tickets by priority level", async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.ticket.count.mockResolvedValue(0);

      await service.list({
        sortBy: "priority",
        sortOrder: "asc",
      });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            priority: { level: "asc" },
          },
        }),
      );
    });
  });
});
