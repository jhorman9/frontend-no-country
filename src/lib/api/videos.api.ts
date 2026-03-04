import { apiClient } from "./client";
import type { 
  VideosResponse, 
  Video, 
  GetVideosOptions, 
  UploadVideoDTO 
} from "@/types/video.types";

const API_BASE = "https://elevideo.onrender.com";

/**
 * Funciones de API para Videos (puras, sin React)
 */
export const videosApi = {
  /**
   * Obtener videos por proyecto
   * Endpoint: GET /api/v1/projects/:projectId/videos
   */
  getByProject: async (
    projectId: number | string,
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: "ASC" | "DESC";
    } = {}
  ): Promise<VideosResponse> => {
    const {
      page = 0,
      size = 20,
      sortBy = "createdAt",
      sortDirection = "DESC",
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
    });

    return apiClient.get<VideosResponse>(
      `/api/v1/projects/${projectId}/videos?${queryParams.toString()}`
    );
  },

  /**
   * Obtener videos de un proyecto con paginación
   */
  getAll: async (options: GetVideosOptions): Promise<VideosResponse> => {
    const { projectId, ...params } = options;
    return videosApi.getByProject(projectId, params);
  },

  /**
   * Obtener un video por ID
   */
  getById: async (projectId: number | string, videoId: number): Promise<Video> => {
    return apiClient.get<Video>(`/api/v1/projects/${projectId}/videos/${videoId}`);
  },

  /**
   * Crear/subir video
   * Endpoint: POST /api/v1/projects/:projectId/videos
   */
  create: async (projectId: number | string, formData: FormData): Promise<Video> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No autenticado");
    }

    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/videos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      throw {
        message: "Sesión expirada. Por favor inicia sesión de nuevo",
        status: 401,
      };
    }

    const responseData = await response.json().catch(() => ({}));

    if (response.status === 400) {
      const fieldErrors = responseData.fieldErrors || {};
      const errorMessages = Object.entries(fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(", ");
      throw {
        message: errorMessages || responseData.message || "Error de validación",
        status: 400,
        fieldErrors,
      };
    }

    if (response.status === 403) {
      throw {
        message: responseData.message || "No tienes permiso para crear videos en este proyecto",
        status: 403,
      };
    }

    if (response.status === 404) {
      throw {
        message: responseData.message || `Proyecto no encontrado con id: ${projectId}`,
        status: 404,
      };
    }

    if (!response.ok) {
      throw {
        message: responseData.message || `Error al subir video (${response.status})`,
        status: response.status,
      };
    }

    return responseData;
  },

  /**
   * Subir un nuevo video
   * Nota: Este método no usa apiClient porque necesita FormData
   */
  upload: async (projectId: number | string, data: UploadVideoDTO): Promise<Video> => {
    const formData = new FormData();
    formData.append("video", data.video);
    formData.append("title", data.title);
    return videosApi.create(projectId, formData);
  },

  /**
   * Actualizar título de un video
   */
  update: async (
    projectId: number | string, 
    videoId: number, 
    data: { title: string }
  ): Promise<Video> => {
    return apiClient.put<Video>(
      `/api/v1/projects/${projectId}/videos/${videoId}`,
      data
    );
  },

  /**
   * Eliminar un video
   */
  delete: async (projectId: number | string, videoId: number): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/projects/${projectId}/videos/${videoId}`);
  },

  /**
   * Descargar un video
   */
  download: async (video: Video): Promise<void> => {
    // Crear un enlace temporal y hacer clic en él
    const link = document.createElement("a");
    link.href = video.secureUrl;
    link.download = `${video.title}.${video.format}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
