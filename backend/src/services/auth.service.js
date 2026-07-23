import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/user.repository.js';
import * as roleRepository from '../repositories/role.repository.js';
import { AppError } from '../utils/AppError.js';

class AuthService {
  mapUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  signToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Register a new user and return user with JWT
  signUp = async (name, email, password, roleName = 'member') => {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(409, 'Email is already registered', 'EMAIL_EXISTS');
    }

    const role = await roleRepository.findByName(roleName);

    if (!role) {
      throw new AppError(400, 'Invalid role', 'INVALID_ROLE');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      roleId: role.id,
    });


    return {
      user: this.mapUser(user),
    };
  };

  // Authenticate user with email and password, return user and JWT
  signIn = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError(401, 'Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = this.signToken(user);

    return {
      user: this.mapUser(user),
      token,
    };
  };

  // Return current authenticated user profile by id
  getProfile = async (userId) => {
    const user = await userRepository.findActiveById(userId);

    if (!user) {
      throw new AppError(401, 'User not found or inactive', 'UNAUTHORIZED');
    }

    return this.mapUser(user);
  };
}

export { AuthService };
export default new AuthService();
