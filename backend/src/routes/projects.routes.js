import express from 'express';
import projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const projectRoutes = express.Router();

projectRoutes.use(authenticate);

projectRoutes.get('/', asyncHandler(projectController.listProjects));

projectRoutes.post(
  '/',
  authorizeRoles('admin', 'pm'),
  asyncHandler(projectController.createProject)
);

projectRoutes.get('/:projectId', asyncHandler(projectController.getProject));

projectRoutes.patch(
  '/:projectId',
  authorizeRoles('admin', 'pm'),
  asyncHandler(projectController.updateProject)
);

projectRoutes.delete(
  '/:projectId',
  authorizeRoles('admin', 'pm'),
  asyncHandler(projectController.deleteProject)
);

projectRoutes.post(
  '/:projectId/managers',
  authorizeRoles('admin'),
  asyncHandler(projectController.assignManager)
);

export default projectRoutes;
