import { TicketStatus } from "@/generated/prisma/enums";
import { prisma } from "@/shared/prisma/prisma";

type DashboardPeriodRequest = {
  startDate: Date;
  endDate: Date;
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const cursor = startOfUtcDay(startDate);
  const finalDate = startOfUtcDay(endDate);

  while (cursor <= finalDate) {
    dates.push(formatUtcDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export class DashboardService {
  async getOverview() {
    const totalTickets = await prisma.ticket.count();

    return {
      totalTickets,
    };
  }

  async getStatusSummary() {
    const groupedTickets = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const countsByStatus = new Map<TicketStatus, number>(
      groupedTickets.map((item) => [item.status, item._count.status]),
    );

    return {
      data: Object.values(TicketStatus).map((status) => ({
        status,
        count: countsByStatus.get(status) ?? 0,
      })),
    };
  }

  async getPrioritySummary() {
    const [priorities, groupedTickets] = await Promise.all([
      prisma.priority.findMany({
        orderBy: [{ level: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          level: true,
        },
      }),
      prisma.ticket.groupBy({
        by: ["priorityId"],
        _count: {
          priorityId: true,
        },
      }),
    ]);

    const countsByPriorityId = new Map<string, number>(
      groupedTickets.map((item) => [item.priorityId, item._count.priorityId]),
    );

    return {
      data: priorities.map((priority) => ({
        ...priority,
        count: countsByPriorityId.get(priority.id) ?? 0,
      })),
    };
  }

  async getPeriodSummary(request: DashboardPeriodRequest) {
    const startDate = startOfUtcDay(request.startDate);
    const endDate = endOfUtcDay(request.endDate);

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const countsByDate = new Map<string, number>();

    for (const ticket of tickets) {
      const dateKey = formatUtcDate(ticket.createdAt);
      countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
    }

    const dates = buildDateRange(startDate, request.endDate);

    return {
      range: {
        startDate: formatUtcDate(startDate),
        endDate: formatUtcDate(endDate),
      },
      totalTickets: tickets.length,
      data: dates.map((date) => ({
        date,
        count: countsByDate.get(date) ?? 0,
      })),
    };
  }
}
