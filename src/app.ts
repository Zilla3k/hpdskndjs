import express, {type Express} from "express";
import cors from "cors";
import helmet from "helmet";

import { healthRouter } from "./routes/health";


export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, _res) => {
    _res.status(200).json({
      message: "Help Desk API is running",
    });
  });

  app.use("/health", healthRouter)

  return app;
}