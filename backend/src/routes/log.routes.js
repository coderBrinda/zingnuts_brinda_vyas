import express from 'express';
import logController from '../controllers/log.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const projectLogRoutes = express.Router({ mergeParams: true });
const entryLogRoutes = express.Router();

projectLogRoutes.use(authenticate);

projectLogRoutes.get('/', asyncHandler(logController.listTimeEntries));
projectLogRoutes.post('/', asyncHandler(logController.createTimeEntry));

entryLogRoutes.use(authenticate);
entryLogRoutes.patch('/:entryId', asyncHandler(logController.updateTimeEntry));
entryLogRoutes.delete('/:entryId', asyncHandler(logController.deleteTimeEntry));

export { entryLogRoutes, projectLogRoutes };
export default projectLogRoutes;
