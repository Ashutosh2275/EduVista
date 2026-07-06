import { apiClient } from '../api/client';
import { mapApiColleges, type ApiCollege } from '../api/mappers/collegeMapper';
import type { CollegeWithSlug } from './collegeService';

export const wishlistService = {
  async getWishlist(): Promise<CollegeWithSlug[]> {
    const data = await apiClient.get<ApiCollege[]>('/wishlist');
    return mapApiColleges(data);
  },

  async addCollege(collegeId: string): Promise<void> {
    await apiClient.post<null>('/wishlist', { collegeId });
  },

  async removeCollege(collegeId: string): Promise<void> {
    await apiClient.delete<null>(`/wishlist/${collegeId}`);
  },

  async clearWishlist(): Promise<void> {
    await apiClient.delete<null>('/wishlist');
  },

  async checkExists(collegeId: string): Promise<boolean> {
    const data = await apiClient.get<{ exists: boolean }>(`/wishlist/check/${collegeId}`);
    return data.exists;
  },
};
