import { TicketHistoryAction, TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { TicketHistoryService } from "./ticketHistoryService";

type CreateTicketRequest = {
  title: string;
  description: string;
  categoryId: string;
  priorityId: string;
  createdById: string;
};

type ListTicketsRequest = {
  status?: TicketStatus;
  categoryId?: string;
  priorityId?: string;
  createdById?: string;
  assignedToId?: string;
};

export class TicketService {
  constructor(private readonly ticketHistoryService = new TicketHistoryService()) {}

  async create(request: CreateTicketRequest) {
    const [category, priority, creator] = await Promise.all([
      prisma.category.findUnique({ where: { id: request.categoryId } }),
      prisma.priority.findUnique({ where: { id: request.priorityId } }),
      prisma.user.findUnique({ where: { id: request.createdById } }),
    ]);

    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    if (!priority) {
      throw new AppError("Priority not found", 404, "PRIORITY_NOT_FOUND");
    }

    if (!creator) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: request.title,
        description: request.description,
        categoryId: request.categoryId,
        priorityId: request.priorityId,
        createdById: request.createdById,
      },
    });

    await this.ticketHistoryService.create({
      ticketId: ticket.id,
      changedById: request.createdById,
      action: TicketHistoryAction.CREATED,
      field: "ticket",
      oldValue: null,
      newValue: request.title,
    });

    return ticket;
  }

  async list(filters: ListTicketsRequest = {}) {
    return prisma.ticket.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.priorityId ? { priorityId: filters.priorityId } : {}),
        ...(filters.createdById ? { createdById: filters.createdById } : {}),
        ...(filters.assignedToId !== undefined ? { assignedToId: filters.assignedToId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
