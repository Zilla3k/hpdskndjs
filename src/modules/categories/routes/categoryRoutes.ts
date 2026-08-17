import { Router } from "express";
import { CategoryController } from "../controller/categoryController";
import { authenticateToken } from "@/shared/middlewares/authMiddleware";
import { authorizeRoles } from "@/shared/middlewares/authorizeRoles";
import { RoleEnum } from "@/shared/enums/roleEnums";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.use(authenticateToken);
categoryRouter.use(authorizeRoles(RoleEnum.ADMIN, RoleEnum.AGENT));

categoryRouter.post("/", categoryController.create.bind(categoryController));
categoryRouter.get("/", categoryController.list.bind(categoryController));
categoryRouter.get("/:categoryId", categoryController.getById.bind(categoryController));
categoryRouter.patch("/:categoryId", categoryController.update.bind(categoryController));
categoryRouter.delete("/:categoryId", categoryController.delete.bind(categoryController));

export default categoryRouter;
