import * as logRepository from '../repositories/log.repository.js';
import * as assignRepository from '../repositories/assign.repository.js';
import * as projectRepository from '../repositories/project.repository.js';
import projectService from './project.service.js';
import { AppError } from '../utils/AppError.js';
import { buildUsage, getCurrentMonthKey } from '../utils/usage.js';

function getMonthDateRange(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = `${monthKey}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

function parseMonthQuery(month) {
  if (!month) {
    return getCurrentMonthKey();
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'Month must be in YYYY-MM format', 'VALIDATION_ERROR');
  }

  return month;
}

class LogService {
  mapEntry(entry) {
    return {
      id: entry.id,
      user: {
        id: entry.user_id,
        name: entry.user_name,
      },
      entryDate: entry.entry_date instanceof Date
        ? entry.entry_date.toISOString().slice(0, 10)
        : String(entry.entry_date).slice(0, 10),
      hours: Number(entry.hours),
      note: entry.note,
      createdAt: entry.created_at,
    };
  }

  async assertCanAccessProject(project, user) {
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

  async assertCanLogTime(project, user) {
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

    throw new AppError(403, 'You are not assigned to log time on this project', 'FORBIDDEN');
  }

  async assertCanManageEntry(entry, user) {
    if (user.role === 'admin') {
      return;
    }

    if (entry.user_id === user.userId) {
      return;
    }

    if (user.role === 'pm') {
      const project = await projectRepository.findById(entry.project_id);

      if (!project) {
        throw new AppError(404, 'Project not found', 'NOT_FOUND');
      }

      await projectService.assertCanManageProject(project, user);
      return;
    }

    throw new AppError(403, 'You do not have permission to manage this time entry', 'FORBIDDEN');
  }

  async getProjectUsage(projectId, monthlyHourCap, monthKey = getCurrentMonthKey()) {
    const { startDate, endDate } = getMonthDateRange(monthKey);
    const currentMonthHours = await logRepository.sumHoursForProjectMonth(
      projectId,
      startDate,
      endDate
    );

    return buildUsage(monthlyHourCap, currentMonthHours);
  }

  canViewUsage(user) {
    return user.role === 'admin' || user.role === 'pm';
  }

  listTimeEntries = async (projectId, user, query = {}) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanAccessProject(project, user);

    const monthKey = parseMonthQuery(query.month);
    const { startDate, endDate } = getMonthDateRange(monthKey);
    const isMember = user.role === 'member';
    let filterUserId = query.userId ? Number(query.userId) : undefined;

    if (query.userId && (Number.isNaN(filterUserId) || filterUserId <= 0)) {
      throw new AppError(400, 'A valid user id is required', 'VALIDATION_ERROR');
    }

    if (isMember) {
      filterUserId = user.userId;
    }

    const entries = await logRepository.findByProject({
      projectId,
      startDate,
      endDate,
      userId: filterUserId,
    });

    const response = {
      projectId: Number(projectId),
      clientName: project.client_name,
      entries: entries.map((entry) => this.mapEntry(entry)),
    };

    if (this.canViewUsage(user)) {
      const usage = await this.getProjectUsage(projectId, project.monthly_hour_cap, monthKey);

      response.usage = {
        month: usage.month,
        currentMonthHours: usage.currentMonthHours,
        monthlyHourCap: Number(project.monthly_hour_cap),
        remainingHours: usage.remainingHours,
        usagePercent: usage.usagePercent,
        capStatus: usage.capStatus,
        capStatusLabel: usage.capStatusLabel,
      };
    }

    return response;
  };

  createTimeEntry = async (projectId, payload, user) => {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError(404, 'Project not found', 'NOT_FOUND');
    }

    await this.assertCanLogTime(project, user);

    const entry = await logRepository.create({
      projectId,
      userId: user.userId,
      entryDate: payload.entryDate,
      hours: payload.hours,
      note: payload.note,
    });

    const response = {
      id: entry.id,
      projectId: Number(projectId),
      entryDate: this.mapEntry(entry).entryDate,
      hours: Number(entry.hours),
      note: entry.note,
    };

    if (this.canViewUsage(user)) {
      const usageAfterEntry = await this.getProjectUsage(projectId, project.monthly_hour_cap);

      response.usageAfterEntry = {
        currentMonthHours: usageAfterEntry.currentMonthHours,
        capStatus: usageAfterEntry.capStatus,
      };
    }

    return response;
  };

  updateTimeEntry = async (entryId, payload, user) => {
    const entry = await logRepository.findById(entryId);

    if (!entry) {
      throw new AppError(404, 'Time entry not found', 'NOT_FOUND');
    }

    await this.assertCanManageEntry(entry, user);

    const updatedEntry = await logRepository.update(entryId, payload);
    const response = this.mapEntry(updatedEntry);

    if (this.canViewUsage(user)) {
      const project = await projectRepository.findById(entry.project_id);
      const usageAfterEntry = await this.getProjectUsage(entry.project_id, project.monthly_hour_cap);

      response.usageAfterEntry = {
        currentMonthHours: usageAfterEntry.currentMonthHours,
        capStatus: usageAfterEntry.capStatus,
      };
    }

    return response;
  };

  deleteTimeEntry = async (entryId, user) => {
    const entry = await logRepository.findById(entryId);

    if (!entry) {
      throw new AppError(404, 'Time entry not found', 'NOT_FOUND');
    }

    await this.assertCanManageEntry(entry, user);

    await logRepository.remove(entryId);

    return { id: Number(entryId) };
  };
}

export { LogService };
export default new LogService();
