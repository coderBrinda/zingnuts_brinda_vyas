import assignService from '../services/assign.service.js';
import {
  validateAssignMember,
  validateRemoveMember,
} from '../validations/assign.validation.js';
import { sendSuccess, sendError } from '../utils/response.js';

class AssignController {
  // GET /api/v1/projects/:projectId/members/available
  listAvailableMembers = async (req, res) => {
    const result = await assignService.listAvailableMembers(req.params.projectId, req.user);
    return sendSuccess(res, 200, result);
  };

  // GET /api/v1/projects/:projectId/members
  listAssignments = async (req, res) => {
    const result = await assignService.listAssignments(req.params.projectId, req.user);
    return sendSuccess(res, 200, result);
  };

  // POST /api/v1/projects/:projectId/members
  assignMember = async (req, res) => {
    const validation = validateAssignMember(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await assignService.assignMember(
      req.params.projectId,
      validation.data.memberId,
      req.user
    );

    return sendSuccess(res, 201, result, 'Member assigned to project');
  };

  // DELETE /api/v1/projects/:projectId/members/:memberId
  removeMember = async (req, res) => {
    const validation = validateRemoveMember(req.params);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await assignService.removeMember(
      req.params.projectId,
      validation.data.memberId,
      req.user
    );

    return sendSuccess(res, 200, result, 'Member removed from project');
  };
}

export { AssignController };
export default new AssignController();
