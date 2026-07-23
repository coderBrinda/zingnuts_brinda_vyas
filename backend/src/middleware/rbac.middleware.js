import { sendError } from '../utils/response.js';

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required', 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied', 'FORBIDDEN');
    }

    next();
  };
}
