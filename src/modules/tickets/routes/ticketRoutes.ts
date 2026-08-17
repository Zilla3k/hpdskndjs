import { Router } from "express";
import { TicketController } from "../controller/ticketController";
import { authenticateToken } from "@/shared/middlewares/authMiddleware";

const ticketRouter = Router();
const ticketController = new TicketController();

ticketRouter.use(authenticateToken);

ticketRouter.post("/", ticketController.create.bind(ticketController));
ticketRouter.get("/", ticketController.list.bind(ticketController));
ticketRouter.patch("/:ticketId/assign", ticketController.assign.bind(ticketController));
ticketRouter.patch("/:ticketId/unassign", ticketController.unassign.bind(ticketController));
ticketRouter.patch("/:ticketId/status", ticketController.updateStatus.bind(ticketController));
ticketRouter.post("/:ticketId/comments", ticketController.comment.bind(ticketController));

export default ticketRouter;
