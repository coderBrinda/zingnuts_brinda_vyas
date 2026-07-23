import express from 'express';
import assignController from '../controllers/assign.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const assignRoutes = express.Router({ mergeParams: true });

assignRoutes.use(authenticate);

assignRoutes.get(
  '/available',
  authorizeRoles('admin', 'pm'),
  asyncHandler(assignController.listAvailableMembers)
);

assignRoutes.get(
  '/',
  authorizeRoles('admin', 'pm'),
  asyncHandler(assignController.listAssignments)
);

assignRoutes.post(
  '/',
  authorizeRoles('admin', 'pm'),
  asyncHandler(assignController.assignMember)
);

assignRoutes.delete(
  '/:memberId',
  authorizeRoles('admin', 'pm'),
  asyncHandler(assignController.removeMember)
);

export default assignRoutes;
