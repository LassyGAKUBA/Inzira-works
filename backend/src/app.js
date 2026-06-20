import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import providerRoutes from "./routes/providers.routes.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "inzira-works-api", time: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);


// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Central error handler (final middleware) ────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (env.nodeEnv !== "test") {
    console.error(`[${status}]`, err.message);
  }
  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
  });
});

export default app;