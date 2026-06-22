import * as providersService from "../services/providers.service.js";
import { asyncHandler, ApiError } from "../utils/apiError.js";

// GET /api/providers  → public list of providers for the browse page
export const list = asyncHandler(async (req, res) => {
  const providers = await providersService.listProviders();
  res.json({ providers });
});

// GET /api/providers/:id  → one provider's full detail
export const getOne = asyncHandler(async (req, res) => {
  const provider = await providersService.getProviderById(req.params.id);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }
  res.json({ provider });
});