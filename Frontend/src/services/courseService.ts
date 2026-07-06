import { apiClient } from '../api/client';
import { mapApiCourseToCatalogItem, mapApiCourses, type ApiCourse } from '../api/mappers/courseMapper';
import type { CourseCatalogItem } from '../types';

export type CourseWithSlug = CourseCatalogItem & { slug: string };

export interface CourseListParams {
  q?: string;
  stream?: string;
  level?: string;
  mode?: string;
  duration?: string;
  minFees?: number;
  maxFees?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const courseService = {
  async getCourses(params: CourseListParams = {}): Promise<{ courses: CourseWithSlug[]; total: number }> {
    const { data, pagination } = await apiClient.getWithPagination<ApiCourse[]>('/courses', {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      q: params.q,
      stream: params.stream,
      level: params.level,
      mode: params.mode,
      duration: params.duration,
      minFees: params.minFees,
      maxFees: params.maxFees,
      rating: params.rating,
      sort: params.sort,
    });
    return {
      courses: mapApiCourses(data),
      total: pagination?.total ?? data.length,
    };
  },

  async getFeatured(limit = 6): Promise<CourseWithSlug[]> {
    const data = await apiClient.get<ApiCourse[]>('/courses/featured', { limit });
    return mapApiCourses(data);
  },

  async getTrending(limit = 6): Promise<CourseWithSlug[]> {
    const data = await apiClient.get<ApiCourse[]>('/courses/trending', { limit });
    return mapApiCourses(data);
  },

  async getPopular(limit = 6): Promise<CourseWithSlug[]> {
    const data = await apiClient.get<ApiCourse[]>('/courses/popular', { limit });
    return mapApiCourses(data);
  },

  async getRecommended(limit = 4): Promise<CourseWithSlug[]> {
    const data = await apiClient.get<ApiCourse[]>('/courses/recommended', { limit });
    return mapApiCourses(data);
  },

  async getBySlug(slug: string): Promise<CourseWithSlug> {
    const data = await apiClient.get<ApiCourse>(`/courses/${slug}`);
    return mapApiCourseToCatalogItem(data);
  },
};
