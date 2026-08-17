import { Router } from "express";
import { UserController } from "../controller/userController";
import { authenticateToken } from "@/shared/middlewares/authMiddleware";
import { authorizeRoles } from "@/shared/middlewares/authorizeRoles";
import { RoleEnum } from "@/shared/enums/roleEnums";

const userRouter = Router();
const userController = new UserController();

userRouter.use(authenticateToken);
userRouter.use(authorizeRoles(RoleEnum.ADMIN));

userRouter.get("/", userController.list.bind(userController));
userRouter.get("/:userId", userController.getById.bind(userController));
userRouter.patch("/:userId", userController.update.bind(userController));
userRouter.delete("/:userId", userController.delete.bind(userController));

export default userRouter;
