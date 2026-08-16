import { TicketHistoryAction } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { TicketHistoryService } from "./ticketHistoryService";

type CreateCommentRequest = {
  ticketId: string;
  userId: string;
  content: string;
};

export class CommentService {
  constructor(private readonly ticketHistoryService = new TicketHistoryService()) {}

  async create(request: CreateCommentRequest) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: request.ticketId },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404, "TICKET_NOT_FOUND");
    }

    const comment = await prisma.comment.create({
      data: {
        ticketId: request.ticketId,
        userId: request.userId,
        content: request.content,
      },
    });

    await this.ticketHistoryService.create({
      ticketId: request.ticketId,
      changedById: request.userId,
      action: TicketHistoryAction.COMMENTED,
      field: "comment",
      oldValue: null,
      newValue: request.content,
    });

    return comment;
  }
}
