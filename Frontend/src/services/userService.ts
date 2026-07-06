import { apiClient } from '../api/client';
import type { AuthUser } from '../types/auth';
import type { CollegeWithSlug } from './collegeService';
import { mapApiColleges, type ApiCollege } from '../api/mappers/collegeMapper';

export interface UserProfile extends AuthUser {
  bio?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  preferences?: {
    interestedFields?: string[];
    preferredLocations?: string[];
    budgetRange?: { min: number; max: number };
    notifications?: boolean;
  };
}

export interface DashboardData {
  profile: UserProfile;
  stats: {
    savedCollegesCount: number;
    compareCount: number;
    wishlistCount: number;
  };
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  recommendedColleges: CollegeWithSlug[];
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/profile', data);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch<null>('/users/change-password', { currentPassword, newPassword });
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const session = JSON.parse(localStorage.getItem('eduvista_auth_session') ?? '{}') as { token?: string };
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'}/users/upload-avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token ?? ''}`,
      },
      body: formData,
      credentials: 'include',
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Avatar upload failed.');
    }
    return json.data.avatar as string;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete<null>('/users/account');
  },

  async getDashboard(): Promise<DashboardData> {
    const data = await apiClient.get<{
      profile: UserProfile;
      stats: DashboardData['stats'];
      recentActivity: DashboardData['recentActivity'];
      recommendedColleges: ApiCollege[];
    }>('/users/dashboard');

    return {
      ...data,
      recommendedColleges: mapApiColleges(data.recommendedColleges ?? []),
    };
  },
};
