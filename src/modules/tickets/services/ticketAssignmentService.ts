import { TicketHistoryAction } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { TicketHistoryService } from "./ticketHistoryService";

type AssignTicketRequest = {
  ticketId: string;
  assignedToId: string;
  assignedById: string;
};

type UnassignTicketRequest = {
  ticketId: string;
  unassignedById: string;
};

export class TicketAssignmentService {
  constructor(private readonly ticketHistoryService = new TicketHistoryService()) {}

  async assign(request: AssignTicketRequest) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: request.ticketId },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404, "TICKET_NOT_FOUND");
    }

    const previousAssignee = ticket.assignedToId;

    const updatedTicket = await prisma.ticket.update({
      where: { id: request.ticketId },
      data: { assignedToId: request.assignedToId },
    });

    await prisma.ticketAssignment.create({
      data: {
        ticketId: request.ticketId,
        assignedToId: request.assignedToId,
        assignedById: request.assignedById,
      },
    });

    await this.ticketHistoryService.create({
      ticketId: request.ticketId,
      changedById: request.assignedById,
      action: TicketHistoryAction.ASSIGNED,
      field: "assignedToId",
      oldValue: previousAssignee,
      newValue: request.assignedToId,
    });

    return updatedTicket;
  }

  async unassign(request: UnassignTicketRequest) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: request.ticketId },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404, "TICKET_NOT_FOUND");
    }

    const previousAssignee = ticket.assignedToId;

    if (!previousAssignee) {
      throw new AppError("Ticket is not assigned", 422, "TICKET_NOT_ASSIGNED");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: request.ticketId },
      data: { assignedToId: null },
    });

    await prisma.ticketAssignment.updateMany({
      where: {
        ticketId: request.ticketId,
        unassignedAt: null,
      },
      data: {
        unassignedAt: new Date(),
      },
    });

    await this.ticketHistoryService.create({
      ticketId: request.ticketId,
      changedById: request.unassignedById,
      action: TicketHistoryAction.UNASSIGNED,
      field: "assignedToId",
      oldValue: previousAssignee,
      newValue: null,
    });

    return updatedTicket;
  }
}
