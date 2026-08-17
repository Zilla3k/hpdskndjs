import { Router } from "express";
import { PriorityController } from "../controller/priorityController";
import { authenticateToken } from "@/shared/middlewares/authMiddleware";
import { authorizeRoles } from "@/shared/middlewares/authorizeRoles";
import { RoleEnum } from "@/shared/enums/roleEnums";

const priorityRouter = Router();
const priorityController = new PriorityController();

priorityRouter.use(authenticateToken);
priorityRouter.use(authorizeRoles(RoleEnum.ADMIN, RoleEnum.AGENT));

priorityRouter.post("/", priorityController.create.bind(priorityController));
priorityRouter.get("/", priorityController.list.bind(priorityController));
priorityRouter.get("/:priorityId", priorityController.getById.bind(priorityController));
priorityRouter.patch("/:priorityId", priorityController.update.bind(priorityController));
priorityRouter.delete("/:priorityId", priorityController.delete.bind(priorityController));

export default priorityRouter;
