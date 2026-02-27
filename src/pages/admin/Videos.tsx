import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Scissors, Download, Trash2, Play, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideos } from "@/hooks/api/use-videos";
import { usePagination } from "@/hooks/ui/use-pagination";
import type { Video } from "@/types/video.types";

const Videos = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proyectoIdParam = searchParams.get("proyectoId");

  // Paginación
  const pagination = usePagination(0);

  // Hook de videos (lógica de negocio)
  const {
    videos,
    loading,
    error,
    totalPages,
    uploadVideo,
    deleteVideo,
    downloadVideo,
    isUploading,
  } = useVideos({ projectId: proyectoIdParam, page: pagination.currentPage, size: 20 });

  // Sincronizar totalPages con paginación
  if (totalPages !== pagination.totalPages) {
    pagination.setTotalPages(totalPages);
  }

  // Función auxiliar para formatear duración
  const formatDuration = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Función auxiliar para calcular tamaño
  const getFileSize = (sizeInBytes: number): string => {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(1);
  };

  // Handler para subir múltiples videos
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Subir cada archivo secuencialmente
    for (const file of Array.from(files)) {
      await uploadVideo(file);
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Resetear paginación después de subir
    pagination.resetPage();
  };

  const handleRecortar = (id: number) => {
    toast({
      title: "Herramienta de recorte",
      description: "Abriendo editor de recorte vertical a horizontal",
    });
  };

  const handleEliminar = async (id: number) => {
    await deleteVideo(id);
  };

  const getEstadoColor = (status: string) => {
    switch (status) {
      case "UPLOADED":
        return "bg-green-500/20 text-green-400";
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400";
      case "ERROR":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getEstadoTexto = (status: string) => {
    switch (status) {
      case "UPLOADED":
        return "Listo";
      case "PROCESSING":
        return "Procesando...";
      case "ERROR":
        return "Error";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con upload */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {proyectoIdParam && (
              <Button
                onClick={() => setSearchParams({})}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 gap-2 p-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h2 className="text-3xl font-bold text-white">
              {proyectoIdParam ? `Videos: Proyecto ${proyectoIdParam}` : "Videos"}
            </h2>
          </div>
          <p className="text-slate-400">
            {proyectoIdParam
              ? `${totalPages > 0 ? `Total: ${videos.length} video(s) en esta página` : 'Gestiona tus videos'}`
              : "Gestiona todos tus videos y recórtalos"}
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !proyectoIdParam || loading}
          className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Subir Video
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp4,.mov,.avi,.webm,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
          onChange={handleUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-cyber-blue animate-spin mx-auto" />
            <p className="text-slate-400">Cargando videos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-destructive/10 border-destructive/50 backdrop-blur">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabla de videos */}
      {!loading && !error && videos.length > 0 ? (
        <>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="border-b border-slate-700/50 bg-slate-700/20">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Video
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Tamaño
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Duración
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Estado
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {videos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                          <Play className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-white truncate">
                            {video.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {getFileSize(video.sizeInBytes)} MB
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDuration(video.durationInMillis)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(video.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(
                          video.status
                        )}`}
                      >
                        {getEstadoTexto(video.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {video.status === "UPLOADED" && (
                          <>
                            <Button
                              onClick={() => handleRecortar(video.id)}
                              size="sm"
                              variant="outline"
                              className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 h-8 text-xs"
                            >
                              <Scissors className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => downloadVideo(video)}
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-400 hover:bg-slate-700/50 h-8 text-xs"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleEliminar(video.id)}
                          size="sm"
                          variant="outline"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 h-8 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={pagination.previousPage}
              disabled={!pagination.canGoPrevious}
              variant="outline"
              className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-slate-400">
              Página {pagination.currentPage + 1} de {pagination.totalPages}
            </span>
            <Button
              onClick={pagination.nextPage}
              disabled={!pagination.canGoNext}
              variant="outline"
              className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
            </Button>
          </div>
        )}
        </>
      ) : !loading && !error ? (
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur">
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {proyectoIdParam ? "Sin videos en este proyecto" : "No hay videos aún"}
                </h3>
                <p className="text-slate-400 mb-6">
                  {proyectoIdParam
                    ? `El proyecto no tiene videos aún`
                    : "Sube tu primer video para comenzar"}
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Subir Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Videos;
