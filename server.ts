import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT || "3000");
const app = next({ dev, hostname: "0.0.0.0", port: PORT });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();

  server.use(express.json());

  const PgStore = connectPgSimple(session);
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    server.set("trust proxy", 1);
  }

  server.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET || "xplore-food-dev-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      },
    })
  );

  const apiRoutes = (await import("./server/routes")).default;
  server.use("/api", apiRoutes);

  server.use((req: any, res: any) => {
    return handle(req, res);
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Xplore Food server running on http://0.0.0.0:${PORT}`);
  });
});
