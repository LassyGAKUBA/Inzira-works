import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

// POST /api/auth/register  → create customer or provider account
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login     → exchange email+password for a token
router.post("/login", validate(loginSchema), authController.login);

// GET  /api/auth/me        → who am I (requires a valid token)
router.get("/me", requireAuth, authController.getMe);

export default router;
