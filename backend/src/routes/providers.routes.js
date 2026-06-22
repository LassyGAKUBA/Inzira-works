import { Router } from "express";
import * as providersController from "../controllers/providers.controller.js";

const router = Router();

router.get("/", providersController.list);
router.get("/:id", providersController.getOne);

export default router;