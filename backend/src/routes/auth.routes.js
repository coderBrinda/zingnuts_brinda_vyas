import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authRoutes = express.Router();

authRoutes.post('/sign-up', asyncHandler(authController.signUp));
authRoutes.post('/sign-in', asyncHandler(authController.signIn));
authRoutes.get('/profile', authenticate, asyncHandler(authController.getProfile));

export default authRoutes;
