import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Eye, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useProyectos } from "@/hooks/api/use-proyectos";
import { useModal } from "@/hooks/ui/use-modal";
import { usePagination } from "@/hooks/ui/use-pagination";

const Proyectos = () => {
  const navigate = useNavigate();
  
  // Paginación
  const pagination = usePagination(0);
  
  // Lógica de negocio de proyectos
  const {
    proyectos,
    loading,
    error,
    totalPages,
    fetchProyectos,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    isCreating,
    isUpdating,
  } = useProyectos({ page: pagination.currentPage, size: 20 });

  // Sincronizar totalPages con paginación
  if (totalPages !== pagination.totalPages) {
    pagination.setTotalPages(totalPages);
  }

  // Modales
  const createModal = useModal();
  const editModal = useModal();

  // Estados de formularios
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ nombre: "", descripcion: "" });

  // Handlers
  const handleNuevoProyecto = () => {
    setFormData({ nombre: "", descripcion: "" });
    createModal.open();
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      return;
    }

    try {
      await createProyecto({
        name: formData.nombre,
        description: formData.descripcion,
      });

      createModal.close();
      setFormData({ nombre: "", descripcion: "" });
      pagination.resetPage();
    } catch {
      // Error manejado por el hook
    }
  };

  const handleCloseModal = () => {
    if (!isCreating) {
      createModal.close();
      setFormData({ nombre: "", descripcion: "" });
    }
  };

  const handleEditClick = (proyecto: { id: number; nombre: string; descripcion: string }) => {
    setEditingProjectId(proyecto.id);
    setEditFormData({ nombre: proyecto.nombre, descripcion: proyecto.descripcion });
    editModal.open();
  };

  const handleEditProyecto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.nombre.trim() || editingProjectId === null) {
      return;
    }

    try {
      await updateProyecto(editingProjectId, {
        name: editFormData.nombre,
        description: editFormData.descripcion,
      });

      editModal.close();
      setEditingProjectId(null);
      setEditFormData({ nombre: "", descripcion: "" });
    } catch {
      // Error manejado por el hook
    }
  };

  const handleCloseEditModal = () => {
    if (!isUpdating) {
      editModal.close();
      setEditingProjectId(null);
      setEditFormData({ nombre: "", descripcion: "" });
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteProyecto(id);
      pagination.resetPage();
    } catch {
      // Error manejado por el hook
    }
  };

  const handlePaginaAnterior = () => {
    pagination.previousPage();
  };

  const handlePaginaSiguiente = () => {
    pagination.nextPage();
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
              onClick={fetchProyectos}
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
                      onClick={() => handleEditClick(proyecto)}
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
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={handlePaginaAnterior}
                disabled={!pagination.canGoPrevious}
                variant="outline"
                className="border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-slate-400">
                Página {pagination.currentPage + 1} de {pagination.totalPages}
              </span>
              <Button
                onClick={handlePaginaSiguiente}
                disabled={!pagination.canGoNext}
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

      {/* Modal para editar proyecto */}
      {editModal.isOpen && editingProjectId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700/50 max-w-md w-full mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Editar Proyecto</CardTitle>
              <Button
                onClick={handleCloseEditModal}
                disabled={isUpdating}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEditProyecto} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre" className="text-white">
                    Nombre del Proyecto
                  </Label>
                  <Input
                    id="edit-nombre"
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={editFormData.nombre}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nombre: e.target.value })
                    }
                    disabled={isUpdating}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-cyber-blue focus-visible:border-cyber-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-descripcion" className="text-white">
                    Descripción (Opcional)
                  </Label>
                  <textarea
                    id="edit-descripcion"
                    placeholder="Describe tu proyecto..."
                    value={editFormData.descripcion}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, descripcion: e.target.value })
                    }
                    disabled={isUpdating}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Actualizar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={isUpdating}
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

      {/* Modal para crear proyecto */}
      {createModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700/50 max-w-md w-full mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Crear Nuevo Proyecto</CardTitle>
              <Button
                onClick={handleCloseModal}
                disabled={isCreating}
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
                    disabled={isCreating}
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
                    disabled={isCreating}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
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
                    disabled={isCreating}
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