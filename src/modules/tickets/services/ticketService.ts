import { TicketHistoryAction, TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";
import { prisma } from "@/shared/prisma/prisma";
import { buildPaginationMeta, getPagination } from "@/shared/pagination/pagination";
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
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "status" | "priority";
  sortOrder?: "asc" | "desc";
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
    const pagination = getPagination({
      page: filters.page,
      limit: filters.limit,
    });

    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.priorityId ? { priorityId: filters.priorityId } : {}),
      ...(filters.createdById ? { createdById: filters.createdById } : {}),
      ...(filters.assignedToId !== undefined ? { assignedToId: filters.assignedToId } : {}),
    };

    const orderBy =
      filters.sortBy === "status"
        ? { status: filters.sortOrder ?? "desc" }
        : filters.sortBy === "priority"
          ? { priority: { level: filters.sortOrder ?? "asc" } }
          : { createdAt: filters.sortOrder ?? "desc" };

    const [tickets, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.ticket.count({
        where,
      }),
    ]);

    return {
      data: tickets,
      pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }
}
