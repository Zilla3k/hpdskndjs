import { TicketHistoryAction } from "@/generated/prisma/enums";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { TicketHistoryService } from "./ticketHistoryService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    ticketHistory: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  ticketHistory: {
    create: jest.Mock;
  };
};

describe("TicketHistoryService", () => {
  const service = new TicketHistoryService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a ticket history record", async () => {
    mockPrisma.ticketHistory.create.mockResolvedValue({
      id: "history-1",
      ticketId: "ticket-1",
      changedById: "user-1",
      action: TicketHistoryAction.CREATED,
      field: "ticket",
      oldValue: null,
      newValue: "Ticket title",
    });

    const result = await service.create({
      ticketId: "ticket-1",
      changedById: "user-1",
      action: TicketHistoryAction.CREATED,
      field: "ticket",
      oldValue: null,
      newValue: "Ticket title",
    });

    expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        changedById: "user-1",
        action: TicketHistoryAction.CREATED,
        field: "ticket",
        oldValue: null,
        newValue: "Ticket title",
      },
    });
    expect(result).toEqual({
      id: "history-1",
      ticketId: "ticket-1",
      changedById: "user-1",
      action: TicketHistoryAction.CREATED,
      field: "ticket",
      oldValue: null,
      newValue: "Ticket title",
    });
  });
});
