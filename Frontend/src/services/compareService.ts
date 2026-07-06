import { apiClient } from '../api/client';
import { mapApiColleges, type ApiCollege } from '../api/mappers/collegeMapper';
import type { CollegeWithSlug } from './collegeService';

export const compareService = {
  async getCompare(): Promise<CollegeWithSlug[]> {
    const data = await apiClient.get<ApiCollege[]>('/compare');
    return mapApiColleges(data);
  },

  async saveCompare(collegeIds: string[]): Promise<void> {
    await apiClient.post<null>('/compare', { collegeIds });
  },

  async clearCompare(): Promise<void> {
    await apiClient.delete<null>('/compare');
  },
};
