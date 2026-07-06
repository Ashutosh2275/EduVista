import { apiClient } from '../api/client';
import { env } from '../config/env';
import type { ApiCollege } from '../api/mappers/collegeMapper';
import type { ApiCourse } from '../api/mappers/courseMapper';
import type { ExportType } from '../constants/admin';
import type {
  AdminAnalytics,
  AdminEnquiry,
  AdminNotification,
  AdminUser,
  CategoryStat,
  DashboardStats,
  PaginatedResult,
  SystemSettingsData,
} from '../types/admin';
import { downloadBlob } from '../utils/csvDownload';

let tokenGetter: (() => string | null) | null = null;

export function setAdminTokenGetter(getter: () => string | null): void {
  tokenGetter = getter;
}

async function fetchExport(type: ExportType): Promise<void> {
  const token = tokenGetter?.();
  const url = `${env.apiBaseUrl}/admin/export?type=${type}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Export failed.');
  }

  const blob = await response.blob();
  downloadBlob(blob, `eduvista-${type}-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

export const adminService = {
  async getDashboard() {
    return apiClient.get<{
      stats: DashboardStats;
      recents: {
        colleges: ApiCollege[];
        enquiries: AdminEnquiry[];
        users: AdminUser[];
      };
    }>('/admin/dashboard');
  },

  async getAnalytics() {
    return apiClient.get<AdminAnalytics>('/admin/analytics');
  },

  async getNotifications() {
    return apiClient.get<{ unreadCount: number; items: AdminNotification[] }>('/admin/notifications');
  },

  async getCategories() {
    return apiClient.get<CategoryStat[]>('/admin/categories');
  },

  async getUsersPaginated(params?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    isActive?: boolean;
    sort?: string;
  }): Promise<PaginatedResult<AdminUser>> {
    const result = await apiClient.getWithPagination<AdminUser[]>('/admin/users', params);
    return { data: result.data, pagination: result.pagination! };
  },

  async getUserById(id: string) {
    return apiClient.get<AdminUser>(`/admin/users/${id}`);
  },

  async updateUser(id: string, data: Partial<AdminUser>) {
    return apiClient.put<AdminUser>(`/admin/users/${id}`, data);
  },

  async deleteUser(id: string) {
    return apiClient.delete<null>(`/admin/users/${id}`);
  },

  async setUserStatus(id: string, isActive: boolean) {
    return apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive });
  },

  async getCollegesPaginated(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sort?: string;
  }): Promise<PaginatedResult<ApiCollege>> {
    const result = await apiClient.getWithPagination<ApiCollege[]>('/admin/colleges', params);
    return { data: result.data, pagination: result.pagination! };
  },

  async getCollegeById(id: string) {
    return apiClient.get<ApiCollege>(`/admin/colleges/${id}`);
  },

  async createCollege(data: Record<string, unknown>) {
    return apiClient.post<ApiCollege>('/admin/colleges', data);
  },

  async updateCollege(id: string, data: Record<string, unknown>) {
    return apiClient.put<ApiCollege>(`/admin/colleges/${id}`, data);
  },

  async deleteCollege(id: string) {
    return apiClient.delete<null>(`/admin/colleges/${id}`);
  },

  async publishCollege(id: string) {
    return apiClient.patch<ApiCollege>(`/admin/colleges/${id}/publish`);
  },

  async archiveCollege(id: string) {
    return apiClient.patch<ApiCollege>(`/admin/colleges/${id}/archive`);
  },

  async getCoursesPaginated(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sort?: string;
  }): Promise<PaginatedResult<ApiCourse>> {
    const result = await apiClient.getWithPagination<ApiCourse[]>('/admin/courses', params);
    return { data: result.data, pagination: result.pagination! };
  },

  async getCourseById(id: string) {
    return apiClient.get<ApiCourse>(`/admin/courses/${id}`);
  },

  async createCourse(data: Record<string, unknown>) {
    return apiClient.post<ApiCourse>('/admin/courses', data);
  },

  async updateCourse(id: string, data: Record<string, unknown>) {
    return apiClient.put<ApiCourse>(`/admin/courses/${id}`, data);
  },

  async deleteCourse(id: string) {
    return apiClient.delete<null>(`/admin/courses/${id}`);
  },

  async publishCourse(id: string) {
    return apiClient.patch<ApiCourse>(`/admin/courses/${id}/publish`);
  },

  async archiveCourse(id: string) {
    return apiClient.patch<ApiCourse>(`/admin/courses/${id}/archive`);
  },

  async getEnquiriesPaginated(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sort?: string;
  }): Promise<PaginatedResult<AdminEnquiry>> {
    const result = await apiClient.getWithPagination<AdminEnquiry[]>('/admin/enquiries', params);
    return { data: result.data, pagination: result.pagination! };
  },

  async getEnquiryById(id: string) {
    return apiClient.get<AdminEnquiry>(`/admin/enquiries/${id}`);
  },

  async updateEnquiryStatus(id: string, status: string) {
    return apiClient.patch<AdminEnquiry>(`/admin/enquiries/${id}/status`, { status });
  },

  async updateEnquiryNotes(id: string, notes: string) {
    return apiClient.patch<AdminEnquiry>(`/admin/enquiries/${id}/notes`, { notes });
  },

  async deleteEnquiry(id: string) {
    return apiClient.delete<null>(`/admin/enquiries/${id}`);
  },

  async getSettings() {
    return apiClient.get<SystemSettingsData>('/admin/settings');
  },

  async updateSettings(settings: Partial<SystemSettingsData>) {
    return apiClient.put<SystemSettingsData>('/admin/settings', settings);
  },

  async exportReport(type: ExportType = 'dashboard') {
    return fetchExport(type);
  },
};
