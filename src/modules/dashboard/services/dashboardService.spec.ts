import { TicketStatus } from "@/generated/prisma/enums";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { DashboardService } from "./dashboardService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    ticket: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    priority: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  ticket: {
    count: jest.Mock;
    groupBy: jest.Mock;
    findMany: jest.Mock;
  };
  priority: {
    findMany: jest.Mock;
  };
};

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
  });

  describe("getOverview", () => {
    it("should return the total number of tickets", async () => {
      mockPrisma.ticket.count.mockResolvedValue(12);

      const result = await service.getOverview();

      expect(mockPrisma.ticket.count).toHaveBeenCalledWith();
      expect(result).toEqual({
        totalTickets: 12,
      });
    });
  });

  describe("getStatusSummary", () => {
    it("should return counts for all ticket statuses", async () => {
      mockPrisma.ticket.groupBy.mockResolvedValue([
        { status: TicketStatus.OPEN, _count: { status: 3 } },
        { status: TicketStatus.IN_PROGRESS, _count: { status: 2 } },
      ]);

      const result = await service.getStatusSummary();

      expect(mockPrisma.ticket.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        _count: {
          status: true,
        },
      });
      expect(result).toEqual({
        data: [
          { status: TicketStatus.OPEN, count: 3 },
          { status: TicketStatus.IN_PROGRESS, count: 2 },
          { status: TicketStatus.WAITING_CUSTOMER, count: 0 },
          { status: TicketStatus.RESOLVED, count: 0 },
          { status: TicketStatus.CLOSED, count: 0 },
        ],
      });
    });
  });

  describe("getPrioritySummary", () => {
    it("should return counts grouped by priority", async () => {
      mockPrisma.priority.findMany.mockResolvedValue([
        { id: "priority-1", name: "High", level: 1 },
        { id: "priority-2", name: "Medium", level: 2 },
      ]);
      mockPrisma.ticket.groupBy.mockResolvedValue([
        { priorityId: "priority-1", _count: { priorityId: 5 } },
      ]);

      const result = await service.getPrioritySummary();

      expect(mockPrisma.priority.findMany).toHaveBeenCalledWith({
        orderBy: [{ level: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          level: true,
        },
      });
      expect(mockPrisma.ticket.groupBy).toHaveBeenCalledWith({
        by: ["priorityId"],
        _count: {
          priorityId: true,
        },
      });
      expect(result).toEqual({
        data: [
          { id: "priority-1", name: "High", level: 1, count: 5 },
          { id: "priority-2", name: "Medium", level: 2, count: 0 },
        ],
      });
    });
  });

  describe("getPeriodSummary", () => {
    it("should return counts grouped by day in the requested period", async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([
        { createdAt: new Date("2026-08-01T10:00:00.000Z") },
        { createdAt: new Date("2026-08-01T15:00:00.000Z") },
        { createdAt: new Date("2026-08-03T09:00:00.000Z") },
      ]);

      const result = await service.getPeriodSummary({
        startDate: new Date("2026-08-01T00:00:00.000Z"),
        endDate: new Date("2026-08-03T00:00:00.000Z"),
      });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date("2026-08-01T00:00:00.000Z"),
            lte: new Date("2026-08-03T23:59:59.999Z"),
          },
        },
        select: {
          createdAt: true,
        },
      });
      expect(result).toEqual({
        range: {
          startDate: "2026-08-01",
          endDate: "2026-08-03",
        },
        totalTickets: 3,
        data: [
          { date: "2026-08-01", count: 2 },
          { date: "2026-08-02", count: 0 },
          { date: "2026-08-03", count: 1 },
        ],
      });
    });
  });
});
