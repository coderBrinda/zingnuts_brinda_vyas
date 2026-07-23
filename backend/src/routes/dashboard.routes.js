import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const dashboardRoutes = express.Router();

dashboardRoutes.use(authenticate);
dashboardRoutes.get('/summary', asyncHandler(dashboardController.getSummary));

export default dashboardRoutes;
