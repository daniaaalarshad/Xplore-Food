import express from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 5000;

app.prepare().then(async () => {
  const server = express();

  server.use(express.json());

  try {
    const { setupAuth, registerAuthRoutes } = await import(
      "./server/replit_integrations/auth"
    );
    await setupAuth(server);
    registerAuthRoutes(server);
    console.log("Auth setup complete");
  } catch (error) {
    console.warn("Auth setup skipped:", error);
  }

  const apiRoutes = (await import("./server/routes")).default;
  server.use("/api", apiRoutes);

  server.use((req: any, res: any) => {
    return handle(req, res);
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Xplore Food server running on http://0.0.0.0:${PORT}`);
  });
});
