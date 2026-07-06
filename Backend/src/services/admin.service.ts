import { FilterQuery, SortOrder } from 'mongoose';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { SystemSettingsRepository } from '../repositories/systemSettings.repository';
import { UserRepository } from '../repositories/user.repository';
import { CollegeRepository } from '../repositories/college.repository';
import { CourseRepository } from '../repositories/course.repository';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import { IAuditLogDocument, ISystemSettingsDocument, IUserDocument, User, College, Course, Enquiry } from '../models';
import {
  ApiError,
  buildRegexFilter,
  buildPaginationMeta,
  mergeFilters,
  parseSortQuery,
} from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import { ROLES } from '../constants/roles';

const COLLEGE_CATEGORIES = ['engineering', 'medical', 'management', 'law', 'design', 'science', 'arts'] as const;

type MonthlyCount = { label: string; count: number };

function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

function buildMonthlySeries(
  rows: Array<{ _id: { year: number; month: number }; count: number }>,
  months = 6
): MonthlyCount[] {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    map.set(formatMonthLabel(row._id.year, row._id.month), row.count);
  });

  const series: MonthlyCount[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = formatMonthLabel(d.getFullYear(), d.getMonth() + 1);
    series.push({ label, count: map.get(label) ?? 0 });
  }
  return series;
}

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ];
  return lines.join('\n');
}

export class AdminService {
  private auditLogRepository: AuditLogRepository;
  private settingsRepository: SystemSettingsRepository;
  private userRepository: UserRepository;
  private collegeRepository: CollegeRepository;
  private courseRepository: CourseRepository;
  private enquiryRepository: EnquiryRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
    this.settingsRepository = new SystemSettingsRepository();
    this.userRepository = new UserRepository();
    this.collegeRepository = new CollegeRepository();
    this.courseRepository = new CourseRepository();
    this.enquiryRepository = new EnquiryRepository();
  }

  // ────────────────────────────────────────────────────────────
  // 1. Dashboard Statistics
  // ────────────────────────────────────────────────────────────

  async getDashboardData(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalColleges,
      totalCourses,
      totalEnquiries,
      activeUsers,
      newRegistrations,
      adminCount,
      studentCount,
      newEnquiries,
      recentColleges,
      recentEnquiries,
      recentUsers,
    ] = await Promise.all([
      this.userRepository.count({}),
      this.collegeRepository.count({}),
      this.courseRepository.count({}),
      this.enquiryRepository.count({}),
      this.userRepository.count({ isActive: true }),
      this.userRepository.count({ createdAt: { $gte: thirtyDaysAgo } }),
      this.userRepository.count({ role: ROLES.ADMIN }),
      this.userRepository.count({ role: ROLES.USER }),
      this.enquiryRepository.count({ status: 'new' }),
      this.collegeRepository.find({}, { createdAt: -1 }, 0, 5),
      this.enquiryRepository.find({}, { createdAt: -1 }, 0, 5),
      this.userRepository.find({} as any, { createdAt: -1 } as any, 0, 5),
    ]);

    return {
      stats: {
        totalUsers,
        totalColleges,
        totalCourses,
        totalEnquiries,
        totalCategories: COLLEGE_CATEGORIES.length,
        activeUsers,
        newRegistrations,
        adminCount,
        studentCount,
        newEnquiries,
      },
      recents: {
        colleges: recentColleges,
        enquiries: recentEnquiries,
        users: recentUsers,
      },
    };
  }

  // ────────────────────────────────────────────────────────────
  // 2. Analytical Feeds
  // ────────────────────────────────────────────────────────────

  async getAnalytics(): Promise<any> {
    const defaultLimit = 5;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      topColleges,
      topCourses,
      topCities,
      registrationTrend,
      enquiryTrend,
      collegeTrend,
      courseDistribution,
    ] = await Promise.all([
      this.collegeRepository.find({ status: 'published' }, { rating: -1 }, 0, defaultLimit),
      this.courseRepository.find({ status: 'published' }, { numberOfCollegesOffering: -1 }, 0, defaultLimit),
      this.aggregateTopCities(defaultLimit),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Enquiry.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      College.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Course.aggregate([
        { $group: { _id: '$stream', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      topColleges,
      topCourses,
      topCities,
      trends: {
        monthlyRegistrations: buildMonthlySeries(registrationTrend),
        monthlyEnquiries: buildMonthlySeries(enquiryTrend),
        monthlyColleges: buildMonthlySeries(collegeTrend),
      },
      courseDistribution: courseDistribution.map((item: { _id: string; count: number }) => ({
        stream: item._id,
        count: item.count,
      })),
    };
  }

  private async aggregateTopCities(limit: number): Promise<any[]> {
    // Requires Mongoose schema model aggregation
    const results = await this.collegeRepository.find({}, {}, 0, 1000); // Fetch to process if needed, or run raw Mongoose model aggregator
    const counts: Record<string, number> = {};
    results.forEach((c) => {
      if (c.location && c.location.city) {
        counts[c.location.city] = (counts[c.location.city] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ────────────────────────────────────────────────────────────
  // 3. User Management
  // ────────────────────────────────────────────────────────────

  async getUsers(options: {
    q?: string;
    role?: string;
    isActive?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: IUserDocument[]; pagination: any }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<IUserDocument>[] = [];

    if (options.q) {
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [{ name: regex }, { email: regex }, { phone: regex }],
        });
      }
    }

    if (options.role) {
      filters.push({ role: options.role });
    }

    if (options.isActive !== undefined) {
      filters.push({ isActive: options.isActive });
    }

    const finalFilter = mergeFilters(...filters);
    const sort = parseSortQuery(options.sort, { createdAt: -1 }) as Record<string, SortOrder>;

    const users = await this.userRepository.find(finalFilter, sort, skip, limit);
    const total = await this.userRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { users, pagination };
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND, 'User not found.');
    }
    return user;
  }

  async updateUser(id: string, data: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND, 'User not found.');
    }

    // Role, Name, Phone updates
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    return user.save();
  }

  async softDeleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND, 'User not found.');
    }
    user.isActive = false;
    await user.save();
  }

  // ────────────────────────────────────────────────────────────
  // 4. Audit Log Processing
  // ────────────────────────────────────────────────────────────

  async getAuditLogs(options: {
    adminId?: string;
    resource?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: IAuditLogDocument[]; pagination: any }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<IAuditLogDocument>[] = [];

    if (options.adminId) {
      filters.push({ adminId: options.adminId });
    }

    if (options.resource) {
      filters.push({ resource: options.resource });
    }

    const finalFilter = mergeFilters(...filters);
    const sort = parseSortQuery(options.sort, { createdAt: -1 }) as Record<string, SortOrder>;

    const logs = await this.auditLogRepository.find(finalFilter, sort, skip, limit);
    const total = await this.auditLogRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { logs, pagination };
  }

  async logAdminAction(
    adminId: string,
    action: string,
    resource: 'User' | 'College' | 'Course' | 'Enquiry' | 'Settings',
    resourceId?: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.auditLogRepository.create({
      adminId: adminId as any,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  }

  // ────────────────────────────────────────────────────────────
  // 5. System Config Settings
  // ────────────────────────────────────────────────────────────

  async getSettings(): Promise<ISystemSettingsDocument> {
    return this.settingsRepository.getSettings();
  }

  async updateSettings(data: any): Promise<ISystemSettingsDocument> {
    const updated = await this.settingsRepository.updateSettings(data);
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to save configurations.'
      );
    }
    return updated;
  }

  // ────────────────────────────────────────────────────────────
  // 6. Categories & Notifications
  // ────────────────────────────────────────────────────────────

  async getCategories(): Promise<any[]> {
    const [collegeCounts, courseCounts] = await Promise.all([
      College.aggregate([
        { $group: { _id: '$category', collegeCount: { $sum: 1 } } },
        { $sort: { collegeCount: -1 } },
      ]),
      Course.aggregate([
        { $group: { _id: '$stream', courseCount: { $sum: 1 } } },
        { $sort: { courseCount: -1 } },
      ]),
    ]);

    const collegeMap = new Map(collegeCounts.map((c: { _id: string; collegeCount: number }) => [c._id, c.collegeCount]));
    const courseMap = new Map(courseCounts.map((c: { _id: string; courseCount: number }) => [c._id, c.courseCount]));

    return COLLEGE_CATEGORIES.map((category) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      collegeCount: collegeMap.get(category) ?? 0,
      courseCount: courseMap.get(category) ?? 0,
    }));
  }

  async getNotifications(): Promise<{ unreadCount: number; items: any[] }> {
    const [unreadCount, recentEnquiries, recentLogs] = await Promise.all([
      this.enquiryRepository.count({ status: 'new' }),
      this.enquiryRepository.find({ status: 'new' }, { createdAt: -1 }, 0, 8),
      this.auditLogRepository.find({}, { createdAt: -1 }, 0, 5),
    ]);

    const enquiryItems = recentEnquiries.map((e) => ({
      id: e._id.toString(),
      type: 'enquiry' as const,
      title: `New enquiry from ${e.name}`,
      message: e.message?.slice(0, 80) ?? e.email,
      createdAt: e.createdAt,
      read: false,
      href: '/admin/enquiries',
    }));

    const auditItems = recentLogs.map((log) => ({
      id: log._id.toString(),
      type: 'audit' as const,
      title: log.action.replace(/_/g, ' '),
      message: `${log.resource}${log.resourceId ? ` #${log.resourceId}` : ''}`,
      createdAt: log.createdAt,
      read: true,
      href: '/admin/dashboard',
    }));

    const items = [...enquiryItems, ...auditItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return { unreadCount, items };
  }

  // ────────────────────────────────────────────────────────────
  // 7. CSV Export
  // ────────────────────────────────────────────────────────────

  async exportCsv(
    type: 'users' | 'colleges' | 'courses' | 'enquiries' | 'analytics' | 'dashboard'
  ): Promise<string> {
    switch (type) {
      case 'users': {
        const users = await this.userRepository.find({}, { createdAt: -1 }, 0, 5000);
        return toCsv(
          ['Name', 'Email', 'Phone', 'Role', 'Active', 'Created At'],
          users.map((u) => [
            u.name,
            u.email,
            u.phone ?? '',
            u.role,
            u.isActive,
            u.createdAt?.toISOString?.() ?? u.createdAt,
          ])
        );
      }
      case 'colleges': {
        const colleges = await this.collegeRepository.find({}, { createdAt: -1 }, 0, 5000);
        return toCsv(
          ['Name', 'Category', 'City', 'State', 'Status', 'Rating', 'Created At'],
          colleges.map((c) => [
            c.name,
            c.category,
            c.location?.city,
            c.location?.state,
            c.status,
            c.rating,
            c.createdAt?.toISOString?.() ?? c.createdAt,
          ])
        );
      }
      case 'courses': {
        const courses = await this.courseRepository.find({}, { createdAt: -1 }, 0, 5000);
        return toCsv(
          ['Name', 'Stream', 'Degree Level', 'Duration', 'Status', 'Rating', 'Created At'],
          courses.map((c) => [
            c.name,
            c.stream,
            c.degreeLevel,
            c.duration,
            c.status,
            c.rating,
            c.createdAt?.toISOString?.() ?? c.createdAt,
          ])
        );
      }
      case 'enquiries': {
        const enquiries = await this.enquiryRepository.find({}, { createdAt: -1 }, 0, 5000);
        return toCsv(
          ['Name', 'Email', 'Phone', 'Status', 'Course', 'College', 'Created At'],
          enquiries.map((e) => [
            e.name,
            e.email,
            e.phone ?? '',
            e.status,
            e.interestedCourse ?? '',
            e.college ?? '',
            e.createdAt?.toISOString?.() ?? e.createdAt,
          ])
        );
      }
      case 'analytics':
      case 'dashboard': {
        const [dashboard, analytics] = await Promise.all([this.getDashboardData(), this.getAnalytics()]);
        const statRows = Object.entries(dashboard.stats).map(([key, value]) => [key, value]);
        const trendRows = analytics.trends.monthlyRegistrations.map((m: MonthlyCount) => [
          m.label,
          m.count,
        ]);
        return [
          'Dashboard Statistics',
          toCsv(['Metric', 'Value'], statRows),
          '',
          'Monthly Registrations',
          toCsv(['Month', 'Count'], trendRows),
        ].join('\n');
      }
      default:
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, 'Invalid export type.');
    }
  }
}

export default AdminService;
