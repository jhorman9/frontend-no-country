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
   * Obtener videos de un proyecto con paginación
   */
  getAll: async (options: GetVideosOptions): Promise<VideosResponse> => {
    const { 
      projectId, 
      page = 0, 
      size = 20, 
      sortBy = "createdAt", 
      sortDirection = "DESC" 
    } = options;

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
   * Obtener un video por ID
   */
  getById: async (projectId: number | string, videoId: number): Promise<Video> => {
    return apiClient.get<Video>(`/api/v1/projects/${projectId}/videos/${videoId}`);
  },

  /**
   * Subir un nuevo video
   * Nota: Este método no usa apiClient porque necesita FormData
   */
  upload: async (projectId: number | string, data: UploadVideoDTO): Promise<Video> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No autenticado");
    }

    const formData = new FormData();
    formData.append("video", data.video);
    formData.append("title", data.title);

    const response = await fetch(
      `${API_BASE}/api/v1/projects/${projectId}/videos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NO incluir Content-Type para que el navegador lo establezca automáticamente con boundary
        },
        body: formData,
      }
    );

    // Manejar 401
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw {
        message: "Sesión expirada. Por favor inicia sesión de nuevo",
        status: 401,
      };
    }

    // Obtener datos de respuesta
    const responseData = await response.json().catch(() => ({}));

    // Manejar errores específicos
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
