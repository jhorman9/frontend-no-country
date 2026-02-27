import { apiClient } from "./client";
import type {
  ProyectoAPI,
  PaginationResponse,
  CreateProyectoDTO,
  UpdateProyectoDTO,
} from "@/types/proyecto.types";

export const proyectosApi = {
  /**
   * Obtiene la lista de proyectos con paginación
   */
  getAll: async (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
  }): Promise<PaginationResponse<ProyectoAPI>> => {
    const { page = 0, size = 20, sortBy = "createdAt", sortDirection = "DESC" } = params;
    return apiClient.get<PaginationResponse<ProyectoAPI>>(
      `/projects?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    );
  },

  /**
   * Obtiene un proyecto por ID
   */
  getById: async (id: number): Promise<ProyectoAPI> => {
    return apiClient.get<ProyectoAPI>(`/projects/${id}`);
  },

  /**
   * Crea un nuevo proyecto
   */
  create: async (data: CreateProyectoDTO): Promise<ProyectoAPI> => {
    return apiClient.post<ProyectoAPI>("/projects", data);
  },

  /**
   * Actualiza un proyecto existente
   */
  update: async (id: number, data: UpdateProyectoDTO): Promise<ProyectoAPI> => {
    return apiClient.put<ProyectoAPI>(`/projects/${id}`, data);
  },

  /**
   * Elimina un proyecto
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};
