import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * asyncHandler — wraps async controller functions.
 *
 * Eliminates the need for try/catch in every async controller.
 * Any thrown error is automatically forwarded to the global error middleware.
 *
 * @example
 * router.get('/colleges', asyncHandler(async (req, res) => {
 *   const colleges = await CollegeService.getAll();
 *   ApiResponse.success(res, colleges);
 * }));
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
