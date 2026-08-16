import "dotenv/config";
import createApp from "./app";

const app = createApp();
const PORT = Number(process.env.PORT) || 3333;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});