import userService from '../services/user.service.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
} from '../validations/user.validation.js';
import { sendSuccess, sendError } from '../utils/response.js';

class UserController {
  // GET /api/v1/users
  listUsers = async (req, res) => {
    const users = await userService.listUsers(req.query);
    return sendSuccess(res, 200, users);
  };

  // POST /api/v1/users
  createUser = async (req, res) => {
    const validation = validateCreateUser(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const user = await userService.createUser(validation.data);
    return sendSuccess(res, 201, user, 'User created');
  };

  // PATCH /api/v1/users/:userId
  updateUser = async (req, res) => {
    const idValidation = validateUserId(req.params);

    if (!idValidation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', idValidation.errors);
    }

    const validation = validateUpdateUser(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const user = await userService.updateUser(
      idValidation.data.userId,
      validation.data,
      req.user
    );

    return sendSuccess(res, 200, user, 'User updated');
  };

  // DELETE /api/v1/users/:userId
  deactivateUser = async (req, res) => {
    const validation = validateUserId(req.params);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await userService.deactivateUser(validation.data.userId, req.user);
    return sendSuccess(res, 200, result, 'User deactivated');
  };
}

export { UserController };
export default new UserController();
