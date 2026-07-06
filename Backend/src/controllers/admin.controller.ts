import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse, parsePagination, ApiError } from '../utils';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * GET /api/v1/admin/dashboard
   */
  getDashboard = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.adminService.getDashboardData();
    return ApiResponse.success(res, data, 'Dashboard summaries retrieved.');
  };

  /**
   * GET /api/v1/admin/analytics
   */
  getAnalytics = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.adminService.getAnalytics();
    return ApiResponse.success(res, data, 'Analytical details compiled.');
  };

  /**
   * GET /api/v1/admin/users
   */
  getUsers = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 20);
    const { q, role, isActive, sort } = req.query;

    const parsedIsActive = isActive !== undefined ? isActive === 'true' : undefined;

    const { users, pagination } = await this.adminService.getUsers({
      q: q as string,
      role: role as string,
      isActive: parsedIsActive,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, users, pagination, 'Users list compiled.');
  };

  /**
   * GET /api/v1/admin/users/:id
   */
  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.adminService.getUserById(id as string);
    return ApiResponse.success(res, user, 'User details retrieved.');
  };

  /**
   * PUT /api/v1/admin/users/:id
   */
  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updated = await this.adminService.updateUser(id as string, req.body);

    // Audit trail logging
    if (req.user) {
      await this.adminService.logAdminAction(
        req.user.id,
        'USER_UPDATE',
        'User',
        id as string,
        { changes: req.body },
        req.ip,
        req.get('User-Agent')
      );
    }

    return ApiResponse.success(res, updated, 'User profile updated successfully.');
  };

  /**
   * DELETE /api/v1/admin/users/:id
   */
  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.adminService.softDeleteUser(id as string);

    // Audit trail logging
    if (req.user) {
      await this.adminService.logAdminAction(
        req.user.id,
        'USER_DELETE',
        'User',
        id as string,
        {},
        req.ip,
        req.get('User-Agent')
      );
    }

    return ApiResponse.success(res, null, 'User profile soft deleted.');
  };

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  changeUserStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      throw ApiError.badRequest('isActive parameter boolean is required in request body.');
    }

    const updated = await this.adminService.updateUser(id as string, { isActive });

    // Audit trail logging
    if (req.user) {
      await this.adminService.logAdminAction(
        req.user.id,
        isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
        'User',
        id as string,
        {},
        req.ip,
        req.get('User-Agent')
      );
    }

    return ApiResponse.success(res, updated, `User active status set to ${isActive}.`);
  };

  /**
   * GET /api/v1/admin/audit-logs
   */
  getAuditLogs = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 20);
    const { adminId, resource, sort } = req.query;

    const { logs, pagination } = await this.adminService.getAuditLogs({
      adminId: adminId as string,
      resource: resource as string,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, logs, pagination, 'Audit logs compiled.');
  };

  /**
   * GET /api/v1/admin/settings
   */
  getSettings = async (req: Request, res: Response): Promise<Response> => {
    const settings = await this.adminService.getSettings();
    return ApiResponse.success(res, settings, 'System settings fetched.');
  };

  /**
   * PUT /api/v1/admin/settings
   */
  updateSettings = async (req: Request, res: Response): Promise<Response> => {
    const settings = await this.adminService.updateSettings(req.body);

    // Audit trail logging
    if (req.user) {
      await this.adminService.logAdminAction(
        req.user.id,
        'SETTINGS_UPDATE',
        'Settings',
        settings.id,
        { changes: req.body },
        req.ip,
        req.get('User-Agent')
      );
    }

    return ApiResponse.success(res, settings, 'System configurations saved.');
  };

  /**
   * GET /api/v1/admin/categories
   */
  getCategories = async (req: Request, res: Response): Promise<Response> => {
    const categories = await this.adminService.getCategories();
    return ApiResponse.success(res, categories, 'Category statistics compiled.');
  };

  /**
   * GET /api/v1/admin/notifications
   */
  getNotifications = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.adminService.getNotifications();
    return ApiResponse.success(res, data, 'Notifications retrieved.');
  };

  /**
   * GET /api/v1/admin/export
   */
  exportData = async (req: Request, res: Response): Promise<void> => {
    const type = (req.query.type as string) || 'dashboard';
    const allowed = ['users', 'colleges', 'courses', 'enquiries', 'analytics', 'dashboard'];
    if (!allowed.includes(type)) {
      throw ApiError.badRequest(`Invalid export type. Allowed: ${allowed.join(', ')}`);
    }

    const csv = await this.adminService.exportCsv(type as any);
    const filename = `eduvista-${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  };
}

export default AdminController;
