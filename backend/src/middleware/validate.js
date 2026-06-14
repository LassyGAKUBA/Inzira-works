import { ApiError } from "../utils/apiError.js";

/**
 * Returns middleware that validates req.body against a zod schema.
 * On success, req.body is replaced with the parsed (and cleaned) data.
 * On failure, responds 400 with a list of human-readable messages.
 *
 *   router.post("/register", validate(registerSchema), register);
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message);
    return next(new ApiError(400, messages.join(", ")));
  }
  req.body = result.data;
  next();
};
