import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/user.repository.js';
import * as roleRepository from '../repositories/role.repository.js';
import { AppError } from '../utils/AppError.js';

class UserService {
  mapUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: Boolean(user.is_active),
      createdAt: user.created_at,
    };
  }

  listUsers = async (query = {}) => {
    const users = await userRepository.findAll({
      role: query.role,
      search: query.search,
    });
    return users.map((user) => this.mapUser(user));
  };

  createUser = async (payload) => {
    const existingUser = await userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError(409, 'Email is already registered', 'EMAIL_EXISTS');
    }

    const role = await roleRepository.findByName(payload.role);

    if (!role) {
      throw new AppError(400, 'Invalid role', 'INVALID_ROLE');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await userRepository.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      roleId: role.id,
    });

    return this.mapUser(user);
  };

  updateUser = async (userId, payload, currentUser) => {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    if (Number(userId) === currentUser.userId && payload.isActive === false) {
      throw new AppError(400, 'You cannot deactivate your own account', 'FORBIDDEN');
    }

    let roleId;
    if (payload.role) {
      const role = await roleRepository.findByName(payload.role);

      if (!role) {
        throw new AppError(400, 'Invalid role', 'INVALID_ROLE');
      }

      roleId = role.id;
    }

    const updatedUser = await userRepository.update(userId, {
      name: payload.name,
      roleId,
      isActive: payload.isActive,
    });

    return this.mapUser(updatedUser);
  };

  deactivateUser = async (userId, currentUser) => {
    if (Number(userId) === currentUser.userId) {
      throw new AppError(400, 'You cannot deactivate your own account', 'FORBIDDEN');
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    await userRepository.update(userId, { isActive: false });

    return { id: Number(userId) };
  };
}

export { UserService };
export default new UserService();
