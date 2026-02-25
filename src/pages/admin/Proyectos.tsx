import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Eye, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProyectoAPI {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationResponse {
  content: ProyectoAPI[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
}

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  creado: string;
}

const PAGE_SIZE = 20;
const API_BASE = "https://elevideo.onrender.com";

const Proyectos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    fetchProyectos();
  }, [currentPage]);

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No autenticado");
        toast({
          title: "Error de autenticación",
          description: "Por favor inicia sesión de nuevo",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE}/projects?page=${currentPage}&size=${PAGE_SIZE}&sortBy=createdAt&sortDirection=DESC`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setError("No autenticado");
        localStorage.removeItem("token");
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado, por favor inicia sesión de nuevo",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al obtener proyectos");
      }

      const data: PaginationResponse = await response.json();
      const proyectosFormateados: Proyecto[] = data.content.map((p) => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description,
        creado: p.createdAt,
      }));

      setProyectos(proyectosFormateados);
      setTotalPages(data.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error al cargar proyectos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProyecto = () => {
    setFormData({ nombre: "", descripcion: "" });
    setShowModal(true);
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el nombre del proyecto",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingProject(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Error de autenticación",
          description: "Por favor inicia sesión de nuevo",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.nombre,
          description: formData.descripcion,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado, por favor inicia sesión de nuevo",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al crear el proyecto");
      }

      toast({
        title: "Proyecto creado",
        description: `"${formData.nombre}" ha sido creado correctamente`,
      });

      setShowModal(false);
      setFormData({ nombre: "", descripcion: "" });
      setCurrentPage(0);
      await fetchProyectos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      toast({
        title: "Error al crear proyecto",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCloseModal = () => {
    if (!creatingProject) {
      setShowModal(false);
      setFormData({ nombre: "", descripcion: "" });
    }
  };

  const handleEliminar = async (id: number) => {
    // Eliminar proyecto
    toast({
      title: "Función en desarrollo",
      description: "La eliminación se implementará proximamente",
    });
  };

  const handlePaginaAnterior = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Proyectos</h2>
          <p className="text-slate-400">
            {totalPages > 0 
              ? `Total: ${proyectos.length} proyecto(s) en esta página`
              : "Gestiona todos tus proyectos de video"}
          </p>
        </div>
        <Button
          onClick={handleNuevoProyecto}
          className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-cyber-blue animate-spin mx-auto" />
            <p className="text-slate-400">Cargando proyectos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-destructive/10 border-destructive/50 backdrop-blur">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                fetchProyectos();
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid de proyectos */}
      {!loading && !error && proyectos.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((proyecto) => (
              <Card
                key={proyecto.id}
                className="bg-slate-800/50 border-slate-700/50 hover:border-cyber-blue/40 transition-all backdrop-blur group cursor-pointer"
              >
                {/* Card Header */}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white mb-1 group-hover:text-cyber-blue transition-colors">
                        {proyecto.nombre}
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-sm line-clamp-2">
                        {proyecto.descripcion || "Sin descripción"}
                      </CardDescription>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                      Activo
                    </span>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Creado:</span>
                      <span className="text-slate-300">
                        {new Date(proyecto.creado).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">ID:</span>
                      <span className="text-slate-300 font-mono text-xs">{proyecto.id}</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={handlePaginaAnterior}
                disabled={currentPage === 0}
                variant="outline"
                className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-slate-400">
                Página {currentPage + 1} de {totalPages}
              </span>
              <Button
                onClick={handlePaginaSiguiente}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && proyectos.length === 0 && (
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

      {/* Modal para crear proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700/50 max-w-md w-full mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Crear Nuevo Proyecto</CardTitle>
              <Button
                onClick={handleCloseModal}
                disabled={creatingProject}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCrearProyecto} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-white">
                    Nombre del Proyecto
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Mi nuevo proyecto"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    disabled={creatingProject}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-cyber-blue focus-visible:border-cyber-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-white">
                    Descripción (Opcional)
                  </Label>
                  <textarea
                    id="descripcion"
                    placeholder="Describe tu proyecto..."
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    disabled={creatingProject}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={creatingProject}
                    className="flex-1 bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Proyecto
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={creatingProject}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Proyectos;