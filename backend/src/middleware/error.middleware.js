import { sendError } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code, err.details);
  }

  console.error(err);
  return sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR');
}
