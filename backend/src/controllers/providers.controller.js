import * as providersService from "../services/providers.service.js";
import { asyncHandler } from "../utils/apiError.js";

// GET /api/providers  → public list of providers for the browse page
export const list = asyncHandler(async (req, res) => {
  const providers = await providersService.listProviders();
  res.json({ providers });
});