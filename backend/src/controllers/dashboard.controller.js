import dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

class DashboardController {
  // GET /api/v1/dashboard/summary
  getSummary = async (req, res) => {
    const summary = await dashboardService.getSummary(req.user);
    return sendSuccess(res, 200, summary);
  };
}

export { DashboardController };
export default new DashboardController();
