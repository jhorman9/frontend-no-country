import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { videosApi } from "@/lib/api/videos.api";
import type { Video, UploadVideoDTO, GetVideosOptions } from "@/types/video.types";
import { VIDEO_CONSTRAINTS } from "@/types/video.types";

/**
 * Opciones para el hook useVideos
 */
export interface UseVideosOptions {
  projectId: number | string | null;
  page?: number;
  size?: number;
  autoFetch?: boolean;
}

/**
 * Return type del hook useVideos
 */
export interface UseVideosReturn {
  // Estado
  videos: Video[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  
  // Operaciones
  fetchVideos: () => Promise<void>;
  uploadVideo: (file: File) => Promise<void>;
  deleteVideo: (videoId: number) => Promise<void>;
  downloadVideo: (video: Video) => void;
  
  // Estados de operaciones
  isUploading: boolean;
  isDeleting: boolean;
}

/**
 * Hook para manejar la lógica de negocio de Videos
 * 
 * @example
 * ```tsx
 * const {
 *   videos,
 *   loading,
 *   uploadVideo,
 *   deleteVideo,
 *   isUploading
 * } = useVideos({ projectId: "123", page: 0 });
 * ```
 */
export const useVideos = (options: UseVideosOptions): UseVideosReturn => {
  const { projectId, page = 0, size = 20, autoFetch = true } = options;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado principal
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Estados de operaciones
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Obtener videos del proyecto
   */
  const fetchVideos = useCallback(async () => {
    if (!projectId) {
      setError("No hay proyecto seleccionado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchOptions: GetVideosOptions = {
        projectId,
        page,
        size,
        sortBy: "createdAt",
        sortDirection: "DESC",
      };

      const response = await videosApi.getAll(fetchOptions);

      setVideos(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar videos";
      setError(errorMessage);

      // Manejar 401 específicamente
      if (typeof err === "object" && err !== null && "status" in err && err.status === 401) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado, por favor inicia sesión de nuevo",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      toast({
        title: "Error al cargar videos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, page, size, navigate, toast]);

  /**
   * Auto-fetch al montar o cambiar página
   */
  useEffect(() => {
    if (autoFetch && projectId) {
      fetchVideos();
    }
  }, [autoFetch, fetchVideos, projectId]);

  /**
   * Validar archivo antes de subir
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validar formato
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const isValidFormat = 
      (VIDEO_CONSTRAINTS.ALLOWED_FORMATS as readonly string[]).includes(file.type) || 
      (VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS as readonly string[]).includes(fileExtension);

    if (!isValidFormat) {
      return {
        valid: false,
        error: `${file.name}: Solo se permiten archivos mp4, mov, avi, webm, mkv`,
      };
    }

    // Validar tamaño
    if (file.size > VIDEO_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `${file.name}: El tamaño máximo permitido es 200MB`,
      };
    }

    return { valid: true };
  };

  /**
   * Subir un video
   */
  const uploadVideo = useCallback(
    async (file: File) => {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Debes seleccionar un proyecto para subir videos",
          variant: "destructive",
        });
        return;
      }

      // Validar archivo
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Archivo no válido",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      try {
        const uploadData: UploadVideoDTO = {
          video: file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Nombre sin extensión
        };

        await videosApi.upload(projectId, uploadData);

        toast({
          title: "Video subido",
          description: `${file.name} se ha subido correctamente`,
        });

        // Recargar videos
        await fetchVideos();
      } catch (err: unknown) {
        console.error("Error al subir video:", err);

        // Manejar error 401
        if (typeof err === "object" && err !== null && "status" in err && err.status === 401) {
          toast({
            title: "Sesión expirada",
            description: "Tu sesión ha expirado, por favor inicia sesión de nuevo",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Otros errores
        const errorMessage = 
          typeof err === "object" && err !== null && "message" in err 
            ? String(err.message) 
            : "Error al subir video";

        toast({
          title: "Error al subir video",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, navigate, toast, fetchVideos]
  );

  /**
   * Eliminar un video
   */
  const deleteVideo = useCallback(
    async (videoId: number) => {
      if (!projectId) return;

      setIsDeleting(true);

      try {
        await videosApi.delete(projectId, videoId);

        toast({
          title: "Video eliminado",
          description: "El video ha sido removido correctamente",
        });

        // Recargar videos
        await fetchVideos();
      } catch (err: unknown) {
        console.error("Error al eliminar video:", err);

        // Manejar error 401
        if (typeof err === "object" && err !== null && "status" in err && err.status === 401) {
          toast({
            title: "Sesión expirada",
            description: "Tu sesión ha expirado, por favor inicia sesión de nuevo",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const errorMessage =
          typeof err === "object" && err !== null && "message" in err
            ? String(err.message)
            : "Error al eliminar video";

        toast({
          title: "Error al eliminar video",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [projectId, navigate, toast, fetchVideos]
  );

  /**
   * Descargar un video
   */
  const downloadVideo = useCallback(
    (video: Video) => {
      videosApi.download(video);
      toast({
        title: "Descarga iniciada",
        description: video.title,
      });
    },
    [toast]
  );

  return {
    // Estado
    videos,
    loading,
    error,
    totalPages,
    totalElements,

    // Operaciones
    fetchVideos,
    uploadVideo,
    deleteVideo,
    downloadVideo,

    // Estados de operaciones
    isUploading,
    isDeleting,
  };
};
