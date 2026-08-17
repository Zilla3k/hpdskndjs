import "dotenv/config";
import createApp from "./app";
import { logger } from "./shared/logger/logger";

const app = createApp();
const PORT = Number(process.env.PORT) || 3333;

const server = app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
  });
});

server.on("error", (error) => {
  logger.error("Failed to start server", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
