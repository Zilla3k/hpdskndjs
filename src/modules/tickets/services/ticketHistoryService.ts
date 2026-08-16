import { TicketHistoryAction } from "@/generated/prisma/enums";
import { prisma } from "@/shared/prisma/prisma";

type CreateTicketHistoryRequest = {
  ticketId: string;
  changedById: string;
  action: TicketHistoryAction;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
};

export class TicketHistoryService {
  async create(request: CreateTicketHistoryRequest) {
    return prisma.ticketHistory.create({
      data: {
        ticketId: request.ticketId,
        changedById: request.changedById,
        action: request.action,
        field: request.field,
        oldValue: request.oldValue ?? null,
        newValue: request.newValue ?? null,
      },
    });
  }
}
