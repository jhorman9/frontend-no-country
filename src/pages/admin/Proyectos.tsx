import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  videos: number;
  creado: string;
  estado: "activo" | "inactivo";
}

const Proyectos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proyectos, setProyectos] = useState<Proyecto[]>([
    {
      id: "1",
      nombre: "Proyecto de Marketing",
      descripcion: "Videos para campaña de redes sociales",
      videos: 5,
      creado: "2024-02-15",
      estado: "activo",
    },
    {
      id: "2",
      nombre: "Contenido Educativo",
      descripcion: "Videos tutorial para plataforma",
      videos: 12,
      creado: "2024-02-10",
      estado: "activo",
    },
  ]);

  const handleNuevoProyecto = () => {
    toast({
      title: "Crear nuevo proyecto",
      description: "Funcionalidad de crear proyecto en desarrollo",
    });
  };

  const handleEliminar = (id: string) => {
    setProyectos(proyectos.filter((p) => p.id !== id));
    toast({
      title: "Proyecto eliminado",
      description: "El proyecto ha sido removido correctamente",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Proyectos</h2>
          <p className="text-slate-400">Gestiona todos tus proyectos de video</p>
        </div>
        <Button
          onClick={handleNuevoProyecto}
          className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Grid de proyectos */}
      {proyectos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((proyecto) => (
            <Card
              key={proyecto.id}
              className="bg-slate-800/50 border-slate-700/50 hover:border-cyber-blue/40 transition-all backdrop-blur group cursor-pointer"
            >
              {/* Card Header con estado */}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white mb-1 group-hover:text-cyber-blue transition-colors">
                      {proyecto.nombre}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      {proyecto.descripcion}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      proyecto.estado === "activo"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {proyecto.estado === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Videos:</span>
                    <span className="text-cyber-blue font-semibold">{proyecto.videos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Creado:</span>
                    <span className="text-slate-300">
                      {new Date(proyecto.creado).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/videos?proyectoId=${proyecto.id}`)}
                    variant="outline"
                    className="flex-1 border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 gap-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700/50 gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleEliminar(proyecto.id)}
                    variant="outline"
                    className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur">
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No hay proyectos aún
                </h3>
                <p className="text-slate-400 mb-6">
                  Crea tu primer proyecto para comenzar
                </p>
                <Button
                  onClick={handleNuevoProyecto}
                  className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Crear Proyecto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Proyectos;
