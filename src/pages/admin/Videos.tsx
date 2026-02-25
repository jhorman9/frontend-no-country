import { useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Scissors, Download, Trash2, Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  nombre: string;
  tamaño: number;
  duracion: string;
  creado: string;
  proyectoId: string;
  proyectoNombre: string;
  estado: "procesando" | "listo" | "error";
}

// Mapeo de IDs de proyectos a nombres
const PROYECTOS_MAP: { [key: string]: string } = {
  "1": "Proyecto de Marketing",
  "2": "Contenido Educativo",
};

const Videos = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proyectoIdParam = searchParams.get("proyectoId");

  const [videos, setVideos] = useState<Video[]>([
    {
      id: "1",
      nombre: "video_marketing_01.mp4",
      tamaño: 125.5,
      duracion: "2:45",
      creado: "2024-02-18",
      proyectoId: "1",
      proyectoNombre: "Proyecto de Marketing",
      estado: "listo",
    },
    {
      id: "2",
      nombre: "video_marketing_02.mp4",
      tamaño: 156.7,
      duracion: "3:20",
      creado: "2024-02-17",
      proyectoId: "1",
      proyectoNombre: "Proyecto de Marketing",
      estado: "listo",
    },
    {
      id: "3",
      nombre: "tutorial_paso1.mp4",
      tamaño: 89.3,
      duracion: "5:12",
      creado: "2024-02-17",
      proyectoId: "2",
      proyectoNombre: "Contenido Educativo",
      estado: "listo",
    },
    {
      id: "4",
      nombre: "tutorial_paso2.mp4",
      tamaño: 102.1,
      duracion: "4:45",
      creado: "2024-02-16",
      proyectoId: "2",
      proyectoNombre: "Contenido Educativo",
      estado: "listo",
    },
  ]);

  // Filtrar videos por proyecto si existe el parámetro
  const videosFiltered = useMemo(() => {
    if (proyectoIdParam) {
      return videos.filter((v) => v.proyectoId === proyectoIdParam);
    }
    return videos;
  }, [videos, proyectoIdParam]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newVideo: Video = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          nombre: file.name,
          tamaño: Number((file.size / 1024 / 1024).toFixed(2)),
          duracion: "0:00",
          creado: new Date().toISOString().split("T")[0],
          proyectoId: proyectoIdParam || "0",
          proyectoNombre: proyectoIdParam ? PROYECTOS_MAP[proyectoIdParam] || "Sin asignar" : "Sin asignar",
          estado: "procesando",
        };
        setVideos([newVideo, ...videos]);
      });
      toast({
        title: "Videos subidos",
        description: `${files.length} video(s) están siendo procesados`,
      });
    }
  };

  const handleRecortar = (id: string) => {
    toast({
      title: "Herramienta de recorte",
      description: "Abriendo editor de recorte vertical a horizontal",
    });
  };

  const handleDescargar = (video: Video) => {
    toast({
      title: "Descarga iniciada",
      description: `${video.nombre}`,
    });
  };

  const handleEliminar = (id: string) => {
    setVideos(videos.filter((v) => v.id !== id));
    toast({
      title: "Video eliminado",
      description: "El video ha sido removido correctamente",
    });
  };

  const getEstadoColor = (estado: Video["estado"]) => {
    switch (estado) {
      case "listo":
        return "bg-green-500/20 text-green-400";
      case "procesando":
        return "bg-blue-500/20 text-blue-400";
      case "error":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getEstadoTexto = (estado: Video["estado"]) => {
    switch (estado) {
      case "listo":
        return "Listo";
      case "procesando":
        return "Procesando...";
      case "error":
        return "Error";
      default:
        return estado;
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
              {proyectoIdParam ? `Videos: ${PROYECTOS_MAP[proyectoIdParam] || "Proyecto"}` : "Videos"}
            </h2>
          </div>
          <p className="text-slate-400">
            {proyectoIdParam
              ? `${videosFiltered.length} video(s) en este proyecto`
              : "Gestiona todos tus videos y recórtalos"}
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
        >
          <Upload className="w-5 h-5" />
          Subir Video
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Tabla de videos */}
      {videosFiltered.length > 0 ? (
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
                  {!proyectoIdParam && (
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Proyecto
                    </th>
                  )}
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
                {videosFiltered.map((video) => (
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
                            {video.nombre}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {video.tamaño} MB
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {video.duracion}
                    </td>
                    {!proyectoIdParam && (
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {video.proyectoNombre}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(video.creado).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(
                          video.estado
                        )}`}
                      >
                        {getEstadoTexto(video.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {video.estado === "listo" && (
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
                              onClick={() => handleDescargar(video)}
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
      ) : (
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
                    ? `El proyecto "${PROYECTOS_MAP[proyectoIdParam] || "Proyecto"}" no tiene videos`
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
      )}
    </div>
  );
};

export default Videos;
