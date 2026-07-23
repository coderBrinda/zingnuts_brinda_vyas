import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './projects.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export default router;
