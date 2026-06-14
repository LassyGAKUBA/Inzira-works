/**
 * An error that carries an HTTP status code.
 * Throw this anywhere in a controller/service and the central
 * error handler in app.js will turn it into a clean JSON response.
 *
 *   throw new ApiError(409, "Email already registered");
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Wraps an async route handler so thrown errors are passed to Express's
 * error handler instead of crashing or hanging the request.
 *
 *   router.post("/login", asyncHandler(login));
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
