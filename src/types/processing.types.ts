export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | string;

export interface ProcessingJob {
  id?: string;
  jobId?: string;
  status: JobStatus;
  processingMode?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoRendition {
  id: string;
  platform?: string;
  processingMode?: string;
  quality?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  outputUrl?: string;
  status?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data?: {
    content?: T[];
    totalElements?: number;
    totalPages?: number;
  };
  content?: T[];
  totalElements?: number;
  totalPages?: number;
}

export interface ProcessVideoPayload {
  processingMode: "vertical" | "short_auto" | "short_manual";
  platform: "tiktok" | "instagram" | "youtube_shorts";
  quality: "fast" | "normal" | "high";
  backgroundMode: "smart_crop" | "blurred" | "black";
  shortAutoDuration?: number;
  shortOptions?: {
    startTime: number;
    duration: number;
  };
  advancedOptions?: {
    headroomRatio: number;
    smoothingStrength: number;
  };
}