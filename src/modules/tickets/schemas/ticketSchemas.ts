import { z } from "zod";
import { TicketStatus } from "@/generated/prisma/enums";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters"),
  description: z.string().min(10, "Description must have at least 10 characters"),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  priorityId: z.string().uuid("Priority ID must be a valid UUID"),
  createdById: z.string().uuid("Creator ID must be a valid UUID"),
});

export const listTicketsQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  categoryId: z.string().uuid().optional(),
  priorityId: z.string().uuid().optional(),
  createdById: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
});
export const ticketParamsSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().uuid("Assigned user ID must be a valid UUID"),
  assignedById: z.string().uuid("Assigner user ID must be a valid UUID"),
});

export const unassignTicketSchema = z.object({
  unassignedById: z.string().uuid("Unassigner user ID must be a valid UUID"),
});

export const updateTicketStatusSchema = z.object({
  changedById: z.string().uuid("User ID must be a valid UUID"),
  status: z.nativeEnum(TicketStatus),
});

export const createCommentSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
  content: z.string().min(1, "Comment content cannot be empty"),
});
