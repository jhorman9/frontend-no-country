import { apiClient } from "./client";
import type { PaginatedResponse, ProcessVideoPayload, ProcessingJob, VideoRendition } from "@/types/processing.types";

export const processingApi = {
  processVideo: async (
    videoId: number | string,
    processData: ProcessVideoPayload
  ): Promise<unknown> => {
    return apiClient.post<unknown>(`/api/v1/videos/${videoId}/process`, processData);
  },

  getJobs: async (
    videoId: number | string,
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<ProcessingJob>> => {
    const query = new URLSearchParams({
      page: String(params.page ?? 0),
      size: String(params.size ?? 20),
    });

    return apiClient.get<PaginatedResponse<ProcessingJob>>(
      `/api/v1/videos/${videoId}/jobs?${query.toString()}`
    );
  },

  getJobStatus: async (videoId: number | string, jobId: string): Promise<ProcessingJob> => {
    return apiClient.get<ProcessingJob>(`/api/v1/videos/${videoId}/jobs/${jobId}`);
  },

  cancelJob: async (videoId: number | string, jobId: string): Promise<unknown> => {
    return apiClient.post<unknown>(`/api/v1/videos/${videoId}/jobs/${jobId}/cancel`, {});
  },

  getRenditions: async (
    videoId: number | string,
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<VideoRendition>> => {
    const query = new URLSearchParams({
      page: String(params.page ?? 0),
      size: String(params.size ?? 20),
    });

    return apiClient.get<PaginatedResponse<VideoRendition>>(
      `/api/v1/videos/${videoId}/rendition?${query.toString()}`
    );
  },

  getRenditionById: async (videoId: number | string, renditionId: string): Promise<VideoRendition> => {
    return apiClient.get<VideoRendition>(
      `/api/v1/videos/${videoId}/rendition/${renditionId}?renditionId=${encodeURIComponent(renditionId)}`
    );
  },

  deleteRendition: async (videoId: number | string, renditionId: string): Promise<unknown> => {
    return apiClient.delete<unknown>(
      `/api/v1/videos/${videoId}/rendition/${renditionId}?renditionId=${encodeURIComponent(renditionId)}`
    );
  },
};