import { Router } from "express";
import { AuthController } from "../controller/authController";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", authController.register.bind(authController));
authRouter.post("/login", authController.login.bind(authController));

export default authRouter;
