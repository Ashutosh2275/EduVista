import { apiClient } from '../api/client';

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  interestedCourse: string;
  college?: string;
  message: string;
}

export const enquiryService = {
  async submitEnquiry(payload: EnquiryPayload): Promise<void> {
    await apiClient.post<null>('/enquiries', payload, { skipAuth: true });
  },
};
