/**
 * Tipos relacionados con Videos
 */

/**
 * Video según lo devuelve la API
 */
export interface VideoAPI {
  id: number;
  title: string;
  secureUrl: string;
  format: string;
  durationInMillis: number;
  sizeInBytes: number;
  width: number;
  height: number;
  status: "UPLOADED" | "PROCESSING" | "ERROR";
  projectId: number;
  projectName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Video para usar en la UI
 */
export type Video = VideoAPI;

/**
 * Respuesta paginada de videos de la API
 */
export interface VideosResponse {
  success: boolean;
  message: string;
  data: {
    content: Video[];
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

/**
 * DTO para subir un video
 */
export interface UploadVideoDTO {
  video: File;
  title: string;
}

/**
 * Opciones para obtener videos
 */
export interface GetVideosOptions {
  projectId: number | string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

/**
 * Constantes de validación
 */
export const VIDEO_CONSTRAINTS = {
  MAX_FILE_SIZE: 200 * 1024 * 1024, // 200MB
  ALLOWED_FORMATS: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska"],
  ALLOWED_EXTENSIONS: [".mp4", ".mov", ".avi", ".webm", ".mkv"],
} as const;
