import { TicketStatus } from "@/generated/prisma/enums";
import { AppError } from "@/shared/errors/appError";

const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
  WAITING_CUSTOMER: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export function canTransitionTicketStatus(from: TicketStatus, to: TicketStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function ensureValidTicketTransition(from: TicketStatus, to: TicketStatus): void {
  if (!canTransitionTicketStatus(from, to)) {
    throw new AppError(
      `Transition invalid from ${from} to ${to}`,
      422,
      "INVALID_TICKET_STATUS_TRANSITION",
    );
  }
}
