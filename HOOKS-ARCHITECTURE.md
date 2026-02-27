# Arquitectura de Hooks - Frontend

## 📁 Estructura

```
src/
├── hooks/
│   ├── api/              # Hooks para lógica de API/negocio
│   │   ├── use-proyectos.ts
│   │   └── use-videos.ts
│   └── ui/               # Hooks para lógica de UI reutilizable
│       ├── use-modal.ts
│       └── use-pagination.ts
├── lib/
│   └── api/              # Funciones API puras (sin React)
│       ├── client.ts
│       ├── proyectos.api.ts
│       └── videos.api.ts
└── types/                # Tipos compartidos
    ├── proyecto.types.ts
    └── video.types.ts
```

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- **UI Hooks** (`hooks/ui/`): Lógica de interfaz reutilizable
- **API Hooks** (`hooks/api/`): Lógica de negocio y datos
- **API Functions** (`lib/api/`): Llamadas HTTP puras
- **Types** (`types/`): Tipos compartidos

### 2. **Composición sobre Implementación**
Los hooks pequeños y específicos se componen para crear funcionalidad compleja:
```tsx
// Componente usando múltiples hooks
const Proyectos = () => {
  const pagination = usePagination(0);
  const createModal = useModal();
  const { proyectos, createProyecto } = useProyectos({ 
    page: pagination.currentPage 
  });
  // ...
};
```

## 📚 Guía de Hooks

### Hooks de UI

#### `useModal()`
Hook para manejar el estado de modales.

**Uso:**
```tsx
const modal = useModal();

// Abrir modal
modal.open();

// Cerrar modal
modal.close();

// JSX
{modal.isOpen && <Modal onClose={modal.close} />}
```

**API:**
- `isOpen: boolean` - Estado del modal
- `open()` - Abre el modal
- `close()` - Cierra el modal
- `toggle()` - Alterna el estado

---

#### `usePagination(initialPage?)`
Hook para manejar paginación.

**Uso:**
```tsx
const pagination = usePagination(0);

// Navegar
pagination.nextPage();
pagination.previousPage();
pagination.goToPage(5);

// Actualizar total
pagination.setTotalPages(10);

// JSX
<Button disabled={!pagination.canGoPrevious} onClick={pagination.previousPage}>
  Anterior
</Button>
```

**API:**
- `currentPage: number` - Página actual
- `totalPages: number` - Total de páginas
- `canGoNext: boolean` - Puede ir a siguiente
- `canGoPrevious: boolean` - Puede ir a anterior
- `goToPage(page)` - Ir a página específica
- `nextPage()` - Siguiente página
- `previousPage()` - Página anterior
- `resetPage()` - Volver a página 0
- `setTotalPages(total)` - Actualizar total

---

### Hooks de API

#### `useProyectos(options)`
Hook para CRUD de proyectos con paginación.

**Opciones:**
```tsx
{
  page?: number;     // Página actual (default: 0)
  size?: number;     // Tamaño de página (default: 20)
  autoFetch?: boolean; // Auto-fetch al montar (default: true)
}
```

**Uso:**
```tsx
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
  isDeleting,
} = useProyectos({ page: 0, size: 20 });

// Crear proyecto
await createProyecto({
  name: "Mi Proyecto",
  description: "Descripción"
});

// Actualizar proyecto
await updateProyecto(id, {
  name: "Nuevo Nombre",
  description: "Nueva Descripción"
});

// Eliminar proyecto
await deleteProyecto(id);

// Recargar manualmente
await fetchProyectos();
```

**API:**
- **Estado:**
  - `proyectos: Proyecto[]` - Lista de proyectos
  - `loading: boolean` - Cargando datos
  - `error: string | null` - Mensaje de error
  - `totalPages: number` - Total de páginas

- **Operaciones:**
  - `fetchProyectos()` - Obtener proyectos
  - `createProyecto(data)` - Crear proyecto
  - `updateProyecto(id, data)` - Actualizar proyecto
  - `deleteProyecto(id)` - Eliminar proyecto

- **Estados de operaciones:**
  - `isCreating: boolean` - Creando proyecto
  - `isUpdating: boolean` - Actualizando proyecto
  - `isDeleting: boolean` - Eliminando proyecto

---

#### `useVideos(options)`
Hook para gestión de videos con paginación.

**Opciones:**
```tsx
{
  projectId: number | string | null; // ID del proyecto (requerido)
  page?: number;     // Página actual (default: 0)
  size?: number;     // Tamaño de página (default: 20)
  autoFetch?: boolean; // Auto-fetch al montar (default: true)
}
```

**Uso:**
```tsx
const {
  videos,
  loading,
  error,
  totalPages,
  uploadVideo,
  deleteVideo,
  downloadVideo,
  isUploading,
  isDeleting,
} = useVideos({ projectId: "123", page: 0 });

// Subir video
await uploadVideo(file);

// Eliminar video
await deleteVideo(videoId);

// Descargar video
downloadVideo(video);
```

**API:**
- **Estado:**
  - `videos: Video[]` - Lista de videos
  - `loading: boolean` - Cargando datos
  - `error: string | null` - Mensaje de error
  - `totalPages: number` - Total de páginas
  - `totalElements: number` - Total de elementos

- **Operaciones:**
  - `fetchVideos()` - Obtener videos
  - `uploadVideo(file)` - Subir video (con validación automática)
  - `deleteVideo(id)` - Eliminar video
  - `downloadVideo(video)` - Descargar video

- **Estados de operaciones:**
  - `isUploading: boolean` - Subiendo video
  - `isDeleting: boolean` - Eliminando video

**Validaciones automáticas:**
- Formatos permitidos: mp4, mov, avi, webm, mkv
- Tamaño máximo: 200MB
- Validación de proyecto seleccionado

---

## 🔧 API Client

### `ApiClient`
Cliente HTTP centralizado que maneja:
- Autenticación automática (Bearer token)
- Manejo de errores HTTP
- Manejo de sesión expirada (401)
- Headers comunes

**Uso directo (no recomendado, usar hooks):**
```tsx
import { apiClient } from '@/lib/api/client';

// GET
const data = await apiClient.get('/endpoint');

// POST
const result = await apiClient.post('/endpoint', { data });

// PUT
const updated = await apiClient.put('/endpoint', { data });

// DELETE
await apiClient.delete('/endpoint');
```

---

## 🚀 Crear Nuevos Hooks

### 1. Hook de UI

**Archivo:** `src/hooks/ui/use-[nombre].ts`

```tsx
import { useState, useCallback } from "react";

export interface Use[Nombre]Return {
  // ... definir API
}

export const use[Nombre] = (): Use[Nombre]Return => {
  // ... implementación
  
  return {
    // ... API pública
  };
};
```

### 2. Hook de API

**Paso 1:** Crear tipos
```tsx
// src/types/[recurso].types.ts
export interface [Recurso]API {
  id: number;
  // ... campos de la API
}

export interface [Recurso] {
  // ... campos para UI
}
```

**Paso 2:** Crear funciones API
```tsx
// src/lib/api/[recurso].api.ts
import { apiClient } from "./client";
import type { [Recurso]API } from "@/types/[recurso].types";

export const [recurso]Api = {
  getAll: async () => apiClient.get<[Recurso]API[]>("/endpoint"),
  getById: async (id: number) => apiClient.get<[Recurso]API>(`/endpoint/${id}`),
  create: async (data) => apiClient.post<[Recurso]API>("/endpoint", data),
  update: async (id, data) => apiClient.put<[Recurso]API>(`/endpoint/${id}`, data),
  delete: async (id) => apiClient.delete(`/endpoint/${id}`),
};
```

**Paso 3:** Crear hook
```tsx
// src/hooks/api/use-[recurso].ts
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { [recurso]Api } from "@/lib/api/[recurso].api";

export const use[Recurso] = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ... operaciones CRUD
  
  return {
    data,
    loading,
    // ... operaciones
  };
};
```

---

## ✅ Beneficios

1. **Reusabilidad**: Hooks compartidos entre componentes
2. **Testabilidad**: Lógica aislada fácil de testear
3. **Mantenibilidad**: Cambios centralizados
4. **Separación de Concerns**: UI separada de lógica de negocio
5. **Type Safety**: TypeScript en toda la aplicación
6. **Composición**: Combinar hooks para funcionalidad compleja

---

## 📝 Ejemplo Completo

```tsx
// Componente limpio usando hooks
const MiComponente = () => {
  // Hooks de UI
  const pagination = usePagination(0);
  const createModal = useModal();
  const editModal = useModal();
  
  // Hook de API
  const {
    proyectos,
    loading,
    createProyecto,
    updateProyecto,
    isCreating,
  } = useProyectos({ page: pagination.currentPage });
  
  // Estados locales (solo UI)
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  
  // Handlers simples
  const handleCreate = async (e) => {
    e.preventDefault();
    await createProyecto(formData);
    createModal.close();
    pagination.resetPage();
  };
  
  return (
    // ... JSX limpio
  );
};
```

---

## 🎨 Convenciones

- **Nombres:** `use[Nombre]` (camelCase)
- **Archivos:** `use-[nombre].ts` (kebab-case)
- **Returns:** Siempre retornar un objeto con API clara
- **Tipos:** Exportar tipos de retorno como `Use[Nombre]Return`
- **Errores:** Manejar en el hook, no propagar a componentes
- **Toast:** Mostrar mensajes en el hook, no en componentes
