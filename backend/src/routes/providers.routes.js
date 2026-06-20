import { Router } from "express";
import * as providersController from "../controllers/providers.controller.js";

const router = Router();

// GET /api/providers  → browse all providers (public, no auth)
router.get("/", providersController.list);

export default router;