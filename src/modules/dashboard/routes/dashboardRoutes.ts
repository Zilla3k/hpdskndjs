import { Router } from "express";
import { DashboardController } from "../controller/dashboardController";
import { authenticateToken } from "@/shared/middlewares/authMiddleware";
import { authorizeRoles } from "@/shared/middlewares/authorizeRoles";
import { RoleEnum } from "@/shared/enums/roleEnums";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.use(authenticateToken);
dashboardRouter.use(authorizeRoles(RoleEnum.ADMIN, RoleEnum.AGENT));

dashboardRouter.get("/", dashboardController.overview.bind(dashboardController));
dashboardRouter.get("/status", dashboardController.byStatus.bind(dashboardController));
dashboardRouter.get("/priorities", dashboardController.byPriorities.bind(dashboardController));
dashboardRouter.get("/period", dashboardController.byPeriod.bind(dashboardController));

export default dashboardRouter;
