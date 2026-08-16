import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/health";
import authRouter from "./modules/auth/routes/authRoutes";

export default function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/api/v1/", (_req, _res) => {
    _res.status(200).json({
      message: "Help Desk API is running",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);

  return app;
}
