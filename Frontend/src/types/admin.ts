import type { PaginationMeta } from '../api/types';
import type { ApiCollege } from '../api/mappers/collegeMapper';
import type { ApiCourse } from '../api/mappers/courseMapper';

export interface DashboardStats {
  totalUsers: number;
  totalColleges: number;
  totalCourses: number;
  totalEnquiries: number;
  totalCategories: number;
  activeUsers: number;
  newRegistrations: number;
  adminCount: number;
  studentCount: number;
  newEnquiries: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AdminEnquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  interestedCourse?: string;
  college?: string;
  message?: string;
  status: 'new' | 'contacted' | 'in-progress' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  collegeCount: number;
  courseCount: number;
}

export interface AdminNotification {
  id: string;
  type: 'enquiry' | 'audit';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href: string;
}

export interface MonthlyTrendPoint {
  label: string;
  count: number;
}

export interface AdminAnalytics {
  topColleges: ApiCollege[];
  topCourses: ApiCourse[];
  topCities: Array<{ city: string; count: number }>;
  trends: {
    monthlyRegistrations: MonthlyTrendPoint[];
    monthlyEnquiries: MonthlyTrendPoint[];
    monthlyColleges: MonthlyTrendPoint[];
  };
  courseDistribution: Array<{ stream: string; count: number }>;
}

export interface SystemSettingsData {
  _id?: string;
  key?: string;
  general: {
    platformName: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  contact: {
    supportEmail: string;
    supportPhone: string;
    address?: string;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
