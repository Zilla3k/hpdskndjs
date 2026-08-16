import { TicketHistoryAction, TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { ensureValidTicketTransition } from "./ticketStatusRulesService";
import { TicketHistoryService } from "./ticketHistoryService";

type UpdateTicketStatusRequest = {
  ticketId: string;
  changedById: string;
  status: TicketStatus;
};

export class TicketStatusService {
  constructor(private readonly ticketHistoryService = new TicketHistoryService()) {}

  async updateStatus(request: UpdateTicketStatusRequest) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: request.ticketId },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404, "TICKET_NOT_FOUND");
    }

    if (ticket.status === request.status) {
      throw new AppError("Ticket already has this status", 422, "TICKET_STATUS_UNCHANGED");
    }

    ensureValidTicketTransition(ticket.status, request.status);

    const updatedTicket = await prisma.ticket.update({
      where: { id: request.ticketId },
      data: { status: request.status },
    });

    await this.ticketHistoryService.create({
      ticketId: request.ticketId,
      changedById: request.changedById,
      action: TicketHistoryAction.STATUS_CHANGED,
      field: "status",
      oldValue: ticket.status,
      newValue: request.status,
    });

    return updatedTicket;
  }
}
