import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req, _res) => {
  return _res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
