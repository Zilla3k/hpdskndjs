import { TicketHistoryAction } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { TicketAssignmentService } from "./ticketAssignmentService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    ticket: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ticketAssignment: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  ticket: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  ticketAssignment: {
    create: jest.Mock;
    updateMany: jest.Mock;
  };
  ticketHistory: {
    create: jest.Mock;
  };
};

describe("TicketAssignmentService", () => {
  const service = new TicketAssignmentService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("assign", () => {
    it("should assign a ticket and create history", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        assignedToId: null,
      });
      mockPrisma.ticket.update.mockResolvedValue({
        id: "ticket-1",
        assignedToId: "agent-1",
      });
      mockPrisma.ticketAssignment.create.mockResolvedValue({
        id: "assignment-1",
      });
      mockPrisma.ticketHistory.create.mockResolvedValue({
        id: "history-1",
      });

      const result = await service.assign({
        ticketId: "ticket-1",
        assignedToId: "agent-1",
        assignedById: "admin-1",
      });

      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
      });
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
        data: { assignedToId: "agent-1" },
      });
      expect(mockPrisma.ticketAssignment.create).toHaveBeenCalledWith({
        data: {
          ticketId: "ticket-1",
          assignedToId: "agent-1",
          assignedById: "admin-1",
        },
      });
      expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
        data: {
          ticketId: "ticket-1",
          changedById: "admin-1",
          action: TicketHistoryAction.ASSIGNED,
          field: "assignedToId",
          oldValue: null,
          newValue: "agent-1",
        },
      });
      expect(result).toEqual({
        id: "ticket-1",
        assignedToId: "agent-1",
      });
    });

    it("should throw when ticket does not exist", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.assign({
          ticketId: "missing-ticket",
          assignedToId: "agent-1",
          assignedById: "admin-1",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("unassign", () => {
    it("should unassign a ticket and create history", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        assignedToId: "agent-1",
      });
      mockPrisma.ticket.update.mockResolvedValue({
        id: "ticket-1",
        assignedToId: null,
      });
      mockPrisma.ticketAssignment.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrisma.ticketHistory.create.mockResolvedValue({
        id: "history-1",
      });

      const result = await service.unassign({
        ticketId: "ticket-1",
        unassignedById: "admin-1",
      });

      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
      });
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
        data: { assignedToId: null },
      });
      expect(mockPrisma.ticketAssignment.updateMany).toHaveBeenCalledWith({
        where: {
          ticketId: "ticket-1",
          unassignedAt: null,
        },
        data: {
          unassignedAt: expect.any(Date),
        },
      });
      expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
        data: {
          ticketId: "ticket-1",
          changedById: "admin-1",
          action: TicketHistoryAction.UNASSIGNED,
          field: "assignedToId",
          oldValue: "agent-1",
          newValue: null,
        },
      });
      expect(result).toEqual({
        id: "ticket-1",
        assignedToId: null,
      });
    });

    it("should throw when ticket does not exist", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.unassign({
          ticketId: "missing-ticket",
          unassignedById: "admin-1",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it("should throw when ticket is not assigned", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: "ticket-1",
        assignedToId: null,
      });

      await expect(
        service.unassign({
          ticketId: "ticket-1",
          unassignedById: "admin-1",
        }),
      ).rejects.toThrow("Ticket is not assigned");
    });
  });
});
