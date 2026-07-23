import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const userRoutes = express.Router();

userRoutes.use(authenticate);
userRoutes.use(authorizeRoles('admin'));

userRoutes.get('/', asyncHandler(userController.listUsers));
userRoutes.post('/', asyncHandler(userController.createUser));
userRoutes.patch('/:userId', asyncHandler(userController.updateUser));
userRoutes.delete('/:userId', asyncHandler(userController.deactivateUser));

export default userRoutes;
