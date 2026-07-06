import { apiClient } from '../api/client';
import type { PaginationMeta } from '../api/types';
import { mapApiCollegeToCollege, mapApiColleges, type ApiCollege } from '../api/mappers/collegeMapper';
import type { College } from '../types';

export type CollegeWithSlug = College & { slug: string };

export interface CollegeListParams {
  q?: string;
  type?: string;
  city?: string;
  state?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CollegeListResult {
  colleges: CollegeWithSlug[];
  pagination: PaginationMeta;
}

export const collegeService = {
  async getColleges(params: CollegeListParams = {}): Promise<CollegeListResult> {
    const { data, pagination } = await apiClient.getWithPagination<ApiCollege[]>('/colleges', {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      q: params.q,
      type: params.type,
      city: params.city,
      state: params.state,
      minFees: params.minFees,
      maxFees: params.maxFees,
      minRating: params.minRating,
      sort: params.sort,
    });

    const colleges = mapApiColleges(data);
    return {
      colleges,
      pagination: pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        total: colleges.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  async getFeatured(limit = 6): Promise<CollegeWithSlug[]> {
    const data = await apiClient.get<ApiCollege[]>('/colleges/featured', { limit });
    return mapApiColleges(data);
  },

  async getTrending(limit = 6): Promise<CollegeWithSlug[]> {
    const data = await apiClient.get<ApiCollege[]>('/colleges/trending', { limit });
    return mapApiColleges(data);
  },

  async getRecommended(limit = 4): Promise<CollegeWithSlug[]> {
    const data = await apiClient.get<ApiCollege[]>('/colleges/recommended', { limit });
    return mapApiColleges(data);
  },

  async getBySlug(slug: string): Promise<CollegeWithSlug> {
    const data = await apiClient.get<ApiCollege>(`/colleges/${slug}`);
    return mapApiCollegeToCollege(data);
  },
};
