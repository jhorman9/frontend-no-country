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

export const userApi = {
  getMe: async (): Promise<Data> => {
    return apiClient.get<Data>("/api/users/me");
  },
};
