import { apiClient } from '../api/client';
import { mapApiColleges, type ApiCollege } from '../api/mappers/collegeMapper';
import { mapApiCourses, type ApiCourse } from '../api/mappers/courseMapper';
import type { CollegeWithSlug } from './collegeService';
import type { CourseWithSlug } from './courseService';

export interface SearchParams {
  q?: string;
  type?: 'college' | 'course' | 'all';
  sort?: string;
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  stream?: string;
}

export interface SearchResult {
  type: string;
  colleges: CollegeWithSlug[];
  courses: CourseWithSlug[];
}

export interface SearchSuggestions {
  colleges: Array<{ _id: string; name: string; slug: string; city?: string }>;
  courses: Array<{ _id: string; name: string; slug: string; stream?: string }>;
}

export const searchService = {
  async search(params: SearchParams): Promise<SearchResult> {
    const data = await apiClient.get<{
      type: string;
      colleges: ApiCollege[];
      courses: ApiCourse[];
    }>('/search', params as Record<string, string | number>);

    return {
      type: data.type,
      colleges: mapApiColleges(data.colleges ?? []),
      courses: mapApiCourses(data.courses ?? []),
    };
  },

  async getSuggestions(q: string, limit = 8): Promise<SearchSuggestions> {
    return apiClient.get<SearchSuggestions>('/search/suggestions', { q, limit });
  },

  async getTrending(limit = 8): Promise<string[]> {
    return apiClient.get<string[]>('/search/trending', { limit });
  },

  async getRecent(): Promise<string[]> {
    return apiClient.get<string[]>('/search/recent');
  },

  async getRecommendations(limit = 6): Promise<{ colleges: CollegeWithSlug[]; courses: CourseWithSlug[] }> {
    const data = await apiClient.get<{ colleges: ApiCollege[]; courses: ApiCourse[] }>(
      '/search/recommendations',
      { limit }
    );
    return {
      colleges: mapApiColleges(data.colleges ?? []),
      courses: mapApiCourses(data.courses ?? []),
    };
  },
};
