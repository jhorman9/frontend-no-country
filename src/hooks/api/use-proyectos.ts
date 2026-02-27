import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { proyectosApi } from "@/lib/api/proyectos.api";
import type { Proyecto, ProyectoAPI, CreateProyectoDTO, UpdateProyectoDTO } from "@/types/proyecto.types";
import type { ApiError } from "@/lib/api/client";

interface UseProyectosOptions {
  page?: number;
  size?: number;
  autoFetch?: boolean;
}

export interface UseProyectosReturn {
  // Estado
  proyectos: Proyecto[];
  loading: boolean;
  error: string | null;
  
  // Operaciones CRUD
  fetchProyectos: () => Promise<void>;
  createProyecto: (data: CreateProyectoDTO) => Promise<void>;
  updateProyecto: (id: number, data: UpdateProyectoDTO) => Promise<void>;
  deleteProyecto: (id: number) => Promise<void>;
  
  // Estados de operaciones
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Paginación
  totalPages: number;
}

/**
 * Hook para manejar toda la lógica de proyectos (CRUD + paginación)
 */
export const useProyectos = (options: UseProyectosOptions = {}): UseProyectosReturn => {
  const {
    page = 0,
    size = 20,
    autoFetch = true,
  } = options;

  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados de operaciones
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Transforma ProyectoAPI a Proyecto (formato UI)
   */
  const transformProyecto = (p: ProyectoAPI): Proyecto => ({
    id: p.id,
    nombre: p.name,
    descripcion: p.description,
    creado: p.createdAt,
  });

  /**
   * Maneja errores de API
   */
  const handleApiError = useCallback((err: unknown, defaultMessage: string) => {
    const apiError = err as ApiError;
    
    if (apiError.status === 401) {
      navigate("/login");
      toast({
        title: "Sesión expirada",
        description: apiError.message,
        variant: "destructive",
      });
      return;
    }

    const errorMessage = apiError.message || defaultMessage;
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [navigate, toast]);

  /**
   * Obtiene la lista de proyectos
   */
  const fetchProyectos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await proyectosApi.getAll({
        page,
        size,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });

      const proyectosFormateados = response.content.map(transformProyecto);
      setProyectos(proyectosFormateados);
      setTotalPages(response.totalPages);
    } catch (err) {
      handleApiError(err, "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  }, [page, size, handleApiError]);

  /**
   * Crea un nuevo proyecto
   */
  const createProyecto = useCallback(async (data: CreateProyectoDTO) => {
    try {
      setIsCreating(true);
      await proyectosApi.create(data);
      
      toast({
        title: "Proyecto creado",
        description: `"${data.name}" ha sido creado correctamente`,
      });

      await fetchProyectos();
    } catch (err) {
      handleApiError(err, "Error al crear proyecto");
      throw err; // Re-throw para que el componente pueda manejarlo si es necesario
    } finally {
      setIsCreating(false);
    }
  }, [fetchProyectos, handleApiError, toast]);

  /**
   * Actualiza un proyecto existente
   */
  const updateProyecto = useCallback(async (id: number, data: UpdateProyectoDTO) => {
    try {
      setIsUpdating(true);
      await proyectosApi.update(id, data);
      
      toast({
        title: "Proyecto actualizado",
        description: `"${data.name}" ha sido actualizado correctamente`,
      });

      await fetchProyectos();
    } catch (err) {
      handleApiError(err, "Error al actualizar proyecto");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchProyectos, handleApiError, toast]);

  /**
   * Elimina un proyecto
   */
  const deleteProyecto = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      await proyectosApi.delete(id);
      
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado correctamente",
      });

      await fetchProyectos();
    } catch (err) {
      handleApiError(err, "Error al eliminar proyecto");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [fetchProyectos, handleApiError, toast]);

  // Auto-fetch al montar o cambiar de página
  useEffect(() => {
    if (autoFetch) {
      fetchProyectos();
    }
  }, [autoFetch, fetchProyectos]);

  return {
    // Estado
    proyectos,
    loading,
    error,
    totalPages,
    
    // Operaciones
    fetchProyectos,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    
    // Estados de operaciones
    isCreating,
    isUpdating,
    isDeleting,
  };
};
