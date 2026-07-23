import * as assignRepository from '../repositories/assign.repository.js';
import * as projectRepository from '../repositories/project.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as logRepository from '../repositories/log.repository.js';
import { AppError } from '../utils/AppError.js';
import { buildUsage, getCurrentMonthKey } from '../utils/usage.js';

function getMonthDateRange(monthKey = getCurrentMonthKey()) {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = `${monthKey}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

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
      usage: project.usage ?? buildUsage(project.monthly_hour_cap, 0),
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
      const isAssignedMember = await assignRepository.isMember(project.id, user.userId);

      if (isCreator || isAssignedManager || isAssignedMember) {
        return;
      }
    }

    if (user.role === 'member') {
      const isAssignedMember = await assignRepository.isMember(project.id, user.userId);

      if (isAssignedMember) {
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

  async mapProjectWithUsage(project, { includeManagers = false } = {}) {
    const { startDate, endDate } = getMonthDateRange();
    const currentMonthHours = await logRepository.sumHoursForProjectMonth(
      project.id,
      startDate,
      endDate
    );

    return this.mapProject(
      {
        ...project,
        usage: buildUsage(project.monthly_hour_cap, currentMonthHours),
      },
      { includeManagers }
    );
  }

  mapProjectForMember(project) {
    return {
      id: project.id,
      projectName: project.project_name,
      clientName: project.client_name,
      createdAt: project.created_at,
    };
  }

  listProjects = async (user) => {
    let projects = [];

    if (user.role === 'admin') {
      projects = await projectRepository.findAllForAdmin();
    } else if (user.role === 'pm') {
      projects = await projectRepository.findAllForPm(user.userId);
    } else if (user.role === 'member') {
      projects = await projectRepository.findAllForMember(user.userId);
      return projects.map((project) => this.mapProjectForMember(project));
    } else {
      throw new AppError(403, 'Access denied', 'FORBIDDEN');
    }

    return Promise.all(projects.map((project) => this.mapProjectWithUsage(project)));
  };

  getProjectById = async (projectId, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanViewProject(project, user);

    if (user.role === 'member') {
      return this.mapProjectForMember(project);
    }

    const managers = await projectRepository.getManagers(projectId);

    return this.mapProjectWithUsage(
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
