import logService from '../services/log.service.js';
import {
  validateCreateTimeEntry,
  validateUpdateTimeEntry,
  validateEntryId,
} from '../validations/log.validation.js';
import { sendSuccess, sendError } from '../utils/response.js';

class LogController {
  // GET /api/v1/projects/:projectId/time-entries
  listTimeEntries = async (req, res) => {
    const result = await logService.listTimeEntries(
      req.params.projectId,
      req.user,
      req.query
    );
    return sendSuccess(res, 200, result);
  };

  // POST /api/v1/projects/:projectId/time-entries
  createTimeEntry = async (req, res) => {
    const validation = validateCreateTimeEntry(req.body, { role: req.user.role });

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await logService.createTimeEntry(
      req.params.projectId,
      validation.data,
      req.user
    );

    return sendSuccess(res, 201, result, 'Time entry logged');
  };

  // PATCH /api/v1/time-entries/:entryId
  updateTimeEntry = async (req, res) => {
    const idValidation = validateEntryId(req.params);

    if (!idValidation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', idValidation.errors);
    }

    const validation = validateUpdateTimeEntry(req.body, { role: req.user.role });

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await logService.updateTimeEntry(
      idValidation.data.entryId,
      validation.data,
      req.user
    );

    return sendSuccess(res, 200, result, 'Time entry updated');
  };

  // DELETE /api/v1/time-entries/:entryId
  deleteTimeEntry = async (req, res) => {
    const validation = validateEntryId(req.params);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await logService.deleteTimeEntry(validation.data.entryId, req.user);
    return sendSuccess(res, 200, result, 'Time entry deleted');
  };
}

export { LogController };
export default new LogController();
