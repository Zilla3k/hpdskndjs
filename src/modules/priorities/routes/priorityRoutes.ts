import { Router } from "express";
import { PriorityController } from "../controller/priorityController";

const priorityRouter = Router();
const priorityController = new PriorityController();

priorityRouter.post("/", priorityController.create.bind(priorityController));
priorityRouter.get("/", priorityController.list.bind(priorityController));
priorityRouter.get("/:priorityId", priorityController.getById.bind(priorityController));
priorityRouter.patch("/:priorityId", priorityController.update.bind(priorityController));
priorityRouter.delete("/:priorityId", priorityController.delete.bind(priorityController));

export default priorityRouter;
