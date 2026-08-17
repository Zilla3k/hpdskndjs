import { Router } from "express";
import { UserController } from "../controller/userController";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/", userController.list.bind(userController));
userRouter.get("/:userId", userController.getById.bind(userController));
userRouter.patch("/:userId", userController.update.bind(userController));
userRouter.delete("/:userId", userController.delete.bind(userController));

export default userRouter;
