import { TicketHistoryAction, TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { TicketStatusService } from "./ticketStatusService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    ticket: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
  ticketHistory: {
    create: jest.Mock;
  };
};

describe("TicketStatusService", () => {
  const service = new TicketStatusService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update ticket status and create history", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
      status: TicketStatus.OPEN,
    });
    mockPrisma.ticket.update.mockResolvedValue({
      id: "ticket-1",
      status: TicketStatus.IN_PROGRESS,
    });
    mockPrisma.ticketHistory.create.mockResolvedValue({
      id: "history-1",
    });

    const result = await service.updateStatus({
      ticketId: "ticket-1",
      changedById: "user-1",
      status: TicketStatus.IN_PROGRESS,
    });

    expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
    });
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      data: { status: TicketStatus.IN_PROGRESS },
    });
    expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        changedById: "user-1",
        action: TicketHistoryAction.STATUS_CHANGED,
        field: "status",
        oldValue: TicketStatus.OPEN,
        newValue: TicketStatus.IN_PROGRESS,
      },
    });
    expect(result).toEqual({
      id: "ticket-1",
      status: TicketStatus.IN_PROGRESS,
    });
  });

  it("should throw when ticket does not exist", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus({
        ticketId: "missing-ticket",
        changedById: "user-1",
        status: TicketStatus.IN_PROGRESS,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should throw when transition is invalid", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
      status: TicketStatus.CLOSED,
    });

    await expect(
      service.updateStatus({
        ticketId: "ticket-1",
        changedById: "user-1",
        status: TicketStatus.OPEN,
      }),
    ).rejects.toThrow("Transition invalid");
  });

  it("should throw when status does not change", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
      status: TicketStatus.OPEN,
    });

    await expect(
      service.updateStatus({
        ticketId: "ticket-1",
        changedById: "user-1",
        status: TicketStatus.OPEN,
      }),
    ).rejects.toThrow("Ticket already has this status");
  });
});
