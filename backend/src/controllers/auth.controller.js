import authService from '../services/auth.service.js';
import { validateSignIn, validateSignUp } from '../validations/auth.validation.js';
import { sendSuccess, sendError } from '../utils/response.js';

class AuthController {
  // POST /api/auth/sign-up
  signUp = async (req, res) => {
    const validation = validateSignUp(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const { name, email, password, role } = validation.data;
    const result = await authService.signUp(name, email, password, role);

    return sendSuccess(res, 201, result, 'Registration successful');
  };

  // POST /api/auth/sign-in
  signIn = async (req, res) => {
    const validation = validateSignIn(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const { email, password } = validation.data;
    const result = await authService.signIn(email, password);

    return sendSuccess(res, 200, result, 'Sign in successful');
  };

  // GET /api/auth/profile
  getProfile = async (req, res) => {
    const user = await authService.getProfile(req.user.userId);
    return sendSuccess(res, 200, user);
  };
}

export { AuthController };
export default new AuthController();
