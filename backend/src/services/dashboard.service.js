import * as logRepository from '../repositories/log.repository.js';
import projectService from './project.service.js';
import { getCurrentMonthKey } from '../utils/usage.js';

function getMonthDateRange(monthKey = getCurrentMonthKey()) {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = `${monthKey}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

class DashboardService {
  getSummary = async (user) => {
    const projects = await projectService.listProjects(user);
    const monthKey = getCurrentMonthKey();

    const warningProjects = projects.filter((p) => p.usage?.capStatus === 'warning');
    const overCapProjects = projects.filter((p) => p.usage?.capStatus === 'over_cap');

    let myHoursThisMonth = 0;

    if (user.role === 'member') {
      const { startDate, endDate } = getMonthDateRange(monthKey);
      myHoursThisMonth = await logRepository.sumHoursForUserMonth(
        user.userId,
        startDate,
        endDate
      );
    }

    return {
      month: monthKey,
      totalProjects: projects.length,
      warningProjects: warningProjects.length,
      overCapProjects: overCapProjects.length,
      myHoursThisMonth,
      projects: projects.map((p) => ({
        id: p.id,
        projectName: p.projectName,
        clientName: p.clientName,
        usagePercent: p.usage?.usagePercent ?? null,
        capStatus: p.usage?.capStatus ?? null,
        currentMonthHours: p.usage?.currentMonthHours ?? null,
        monthlyHourCap: p.monthlyHourCap ?? null,
        createdBy: p.createdBy ?? null,
      })),
    };
  };
}

export { DashboardService };
export default new DashboardService();
