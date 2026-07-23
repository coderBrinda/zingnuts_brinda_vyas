import * as projectRepository from '../repositories/project.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { buildUsage } from '../utils/usage.js';

class ProjectService {
  mapProject(project, { includeManagers = false } = {}) {
    const mapped = {
      id: project.id,
      projectName: project.project_name,
      clientName: project.client_name,
      monthlyHourCap: Number(project.monthly_hour_cap),
      createdBy: {
        id: project.created_by,
        name: project.creator_name,
      },
      usage: buildUsage(project.monthly_hour_cap, 0),
      createdAt: project.created_at,
    };

    if (includeManagers) {
      mapped.managers = project.managers || [];
    }

    return mapped;
  }

  mapCreateResponse(project) {
    return {
      id: project.id,
      projectName: project.project_name,
      clientName: project.client_name,
      monthlyHourCap: Number(project.monthly_hour_cap),
      createdBy: project.created_by,
    };
  }

  async assertCanViewProject(project, user) {
    if (user.role === 'admin') {
      return;
    }

    if (user.role === 'pm') {
      const isCreator = project.created_by === user.userId;
      const isAssignedManager = await projectRepository.isManager(project.id, user.userId);

      if (isCreator || isAssignedManager) {
        return;
      }
    }

    throw new AppError(403, 'You do not have access to this project', 'FORBIDDEN');
  }

  async assertCanManageProject(project, user) {
    if (user.role === 'admin') {
      return;
    }

    if (user.role === 'pm') {
      const isCreator = project.created_by === user.userId;
      const isAssignedManager = await projectRepository.isManager(project.id, user.userId);

      if (isCreator || isAssignedManager) {
        return;
      }
    }

    throw new AppError(403, 'You do not have permission to manage this project', 'FORBIDDEN');
  }

  async assertCanDeleteProject(project, user) {
    if (user.role === 'admin') {
      return;
    }

    if (user.role === 'pm' && project.created_by === user.userId) {
      return;
    }

    throw new AppError(403, 'You do not have permission to delete this project', 'FORBIDDEN');
  }

  listProjects = async (user) => {
    let projects = [];

    if (user.role === 'admin') {
      projects = await projectRepository.findAllForAdmin();
    } else if (user.role === 'pm') {
      projects = await projectRepository.findAllForPm(user.userId);
    } else {
      throw new AppError(403, 'Access denied', 'FORBIDDEN');
    }

    return projects.map((project) => this.mapProject(project));
  };

  getProjectById = async (projectId, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanViewProject(project, user);

    const managers = await projectRepository.getManagers(projectId);

    return this.mapProject(
      {
        ...project,
        managers: managers.map((manager) => ({
          id: manager.id,
          name: manager.name,
          email: manager.email,
        })),
      },
      { includeManagers: true }
    );
  };

  createProject = async (payload, user) => {
    const project = await projectRepository.create({
      projectName: payload.projectName,
      clientName: payload.clientName,
      monthlyHourCap: payload.monthlyHourCap,
      createdBy: user.userId,
    });

    return this.mapCreateResponse(project);
  };

  updateProject = async (projectId, payload, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanManageProject(project, user);

    const updatedProject = await projectRepository.update(projectId, {
      projectName: payload.projectName,
      clientName: payload.clientName,
      monthlyHourCap: payload.monthlyHourCap,
    });

    return this.mapProject(updatedProject);
  };

  deleteProject = async (projectId, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanDeleteProject(project, user);

    await projectRepository.remove(projectId);

    return { id: Number(projectId) };
  };

  assignManager = async (projectId, pmUserId, adminUser) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    const pmUser = await userRepository.findActiveById(pmUserId);

    if (!pmUser) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    if (pmUser.role !== 'pm') {
      throw new AppError(400, 'User must have the pm role', 'INVALID_ROLE');
    }

    await projectRepository.assignManager({
      projectId,
      userId: pmUserId,
      assignedBy: adminUser.userId,
    });

    const managers = await projectRepository.getManagers(projectId);

    return {
      projectId: Number(projectId),
      managers: managers.map((manager) => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
      })),
    };
  };
}

export { ProjectService };
export default new ProjectService();
