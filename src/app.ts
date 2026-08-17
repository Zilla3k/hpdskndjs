import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/health";
import authRouter from "./modules/auth/routes/authRoutes";
import dashboardRouter from "./modules/dashboard/routes/dashboardRoutes";
import categoryRouter from "./modules/categories/routes/categoryRoutes";
import priorityRouter from "./modules/priorities/routes/priorityRoutes";
import ticketRouter from "./modules/tickets/routes/ticketRoutes";
import userRouter from "./modules/users/routes/userRoutes";
import { errorMiddleware } from "./shared/middlewares/errorMiddleware";
import { requestLogger } from "./shared/middlewares/requestLogger";

export default function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/api/v1/", (_req, _res) => {
    _res.status(200).json({
      message: "Help Desk API is running",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/priorities", priorityRouter);
  app.use("/api/v1/tickets", ticketRouter);
  app.use("/api/v1/users", userRouter);
  app.use(errorMiddleware);

  return app;
}
