import { TicketHistoryAction } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { CommentService } from "./commentService";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    ticket: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  ticket: {
    findUnique: jest.Mock;
  };
  comment: {
    create: jest.Mock;
  };
  ticketHistory: {
    create: jest.Mock;
  };
};

describe("CommentService", () => {
  const service = new CommentService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a comment and history", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
    });
    mockPrisma.comment.create.mockResolvedValue({
      id: "comment-1",
      ticketId: "ticket-1",
      userId: "user-1",
      content: "Need help with this ticket",
    });
    mockPrisma.ticketHistory.create.mockResolvedValue({
      id: "history-1",
    });

    const result = await service.create({
      ticketId: "ticket-1",
      userId: "user-1",
      content: "Need help with this ticket",
    });

    expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
    });
    expect(mockPrisma.comment.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        userId: "user-1",
        content: "Need help with this ticket",
      },
    });
    expect(mockPrisma.ticketHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        changedById: "user-1",
        action: TicketHistoryAction.COMMENTED,
        field: "comment",
        oldValue: null,
        newValue: "Need help with this ticket",
      },
    });
    expect(result).toEqual({
      id: "comment-1",
      ticketId: "ticket-1",
      userId: "user-1",
      content: "Need help with this ticket",
    });
  });

  it("should throw when ticket does not exist", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        ticketId: "missing-ticket",
        userId: "user-1",
        content: "Need help with this ticket",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
