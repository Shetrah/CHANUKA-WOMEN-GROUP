import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // The application uses Firebase Client SDK for data and authentication.
  // This server backend serves the static assets and handles routing via Vite.

  // API placeholder routes (if needed in future)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "firebase" });
  });

  return httpServer;
}
