import projectService from '../services/project.service.js';
import {
  validateAssignManager,
  validateCreateProject,
  validateUpdateProject,
} from '../validations/project.validation.js';
import { sendSuccess, sendError } from '../utils/response.js';

class ProjectController {
  // GET /api/v1/projects
  listProjects = async (req, res) => {
    const projects = await projectService.listProjects(req.user);
    return sendSuccess(res, 200, projects);
  };

  // GET /api/v1/projects/:projectId
  getProject = async (req, res) => {
    const project = await projectService.getProjectById(req.params.projectId, req.user);
    return sendSuccess(res, 200, project);
  };

  // POST /api/v1/projects
  createProject = async (req, res) => {
    const validation = validateCreateProject(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const project = await projectService.createProject(validation.data, req.user);
    return sendSuccess(res, 201, project, 'Project created');
  };

  // PATCH /api/v1/projects/:projectId
  updateProject = async (req, res) => {
    const validation = validateUpdateProject(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const project = await projectService.updateProject(
      req.params.projectId,
      validation.data,
      req.user
    );

    return sendSuccess(res, 200, project, 'Project updated');
  };

  // DELETE /api/v1/projects/:projectId
  deleteProject = async (req, res) => {
    const result = await projectService.deleteProject(req.params.projectId, req.user);
    return sendSuccess(res, 200, result, 'Project deleted');
  };

  // POST /api/v1/projects/:projectId/managers
  assignManager = async (req, res) => {
    const validation = validateAssignManager(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', validation.errors);
    }

    const result = await projectService.assignManager(
      req.params.projectId,
      validation.data.userId,
      req.user
    );

    return sendSuccess(res, 201, result, 'Project manager assigned');
  };
}

export { ProjectController };
export default new ProjectController();
