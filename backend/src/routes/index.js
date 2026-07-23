import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './projects.routes.js';
import assignRoutes from './assign.routes.js';
import { entryLogRoutes, projectLogRoutes } from './log.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects/:projectId/members', assignRoutes);
router.use('/projects/:projectId/time-entries', projectLogRoutes);
router.use('/time-entries', entryLogRoutes);

export default router;
