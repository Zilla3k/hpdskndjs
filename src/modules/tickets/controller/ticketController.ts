import type { NextFunction, Request, Response } from "express";
import { validateSchema } from "@/shared/schemas/validateSchemas";
import {
  assignTicketSchema,
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketParamsSchema,
  unassignTicketSchema,
  updateTicketStatusSchema,
} from "../schemas/ticketSchemas";
import { CommentService } from "../services/commentService";
import { TicketAssignmentService } from "../services/ticketAssignmentService";
import { TicketService } from "../services/ticketService";
import { TicketStatusService } from "../services/ticketStatusService";

const ticketService = new TicketService();
const ticketAssignmentService = new TicketAssignmentService();
const ticketStatusService = new TicketStatusService();
const commentService = new CommentService();

export class TicketController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedBody = validateSchema(createTicketSchema, req.body);
      const result = await ticketService.create(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = validateSchema(listTicketsQuerySchema, req.query);
      const result = await ticketService.list(parsedQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = validateSchema(ticketParamsSchema, req.params);
      const parsedBody = validateSchema(assignTicketSchema, req.body);
      const result = await ticketAssignmentService.assign({
        ticketId,
        ...parsedBody,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unassign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = validateSchema(ticketParamsSchema, req.params);
      const parsedBody = validateSchema(unassignTicketSchema, req.body);
      const result = await ticketAssignmentService.unassign({
        ticketId,
        ...parsedBody,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = validateSchema(ticketParamsSchema, req.params);
      const parsedBody = validateSchema(updateTicketStatusSchema, req.body);
      const result = await ticketStatusService.updateStatus({
        ticketId,
        ...parsedBody,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async comment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = validateSchema(ticketParamsSchema, req.params);
      const parsedBody = validateSchema(createCommentSchema, req.body);
      const result = await commentService.create({
        ticketId,
        ...parsedBody,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
