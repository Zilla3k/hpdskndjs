import { Router } from "express";
import { CategoryController } from "../controller/categoryController";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.post("/", categoryController.create.bind(categoryController));
categoryRouter.get("/", categoryController.list.bind(categoryController));
categoryRouter.get("/:categoryId", categoryController.getById.bind(categoryController));
categoryRouter.patch("/:categoryId", categoryController.update.bind(categoryController));
categoryRouter.delete("/:categoryId", categoryController.delete.bind(categoryController));

export default categoryRouter;
