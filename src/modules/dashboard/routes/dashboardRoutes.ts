import { Router } from "express";
import { DashboardController } from "../controller/dashboardController";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get("/", dashboardController.overview.bind(dashboardController));
dashboardRouter.get("/status", dashboardController.byStatus.bind(dashboardController));
dashboardRouter.get("/priorities", dashboardController.byPriorities.bind(dashboardController));
dashboardRouter.get("/period", dashboardController.byPeriod.bind(dashboardController));

export default dashboardRouter;
