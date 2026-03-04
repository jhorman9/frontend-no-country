import { apiClient } from "./client";

export interface Data {
  success: boolean;
  message: string;
  data: UserMeResponse;
}

export interface UserMeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  getMe: async (): Promise<Data> => {
    return apiClient.get<Data>("/api/users/me");
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<Data> => {
    return apiClient.patch<Data>("/api/users", payload);
  },

  changePassword: async (userId: string, payload: ChangePasswordPayload): Promise<Data> => {
    return apiClient.patch<Data>(`/api/users/${userId}/password`, payload);
  },
};
