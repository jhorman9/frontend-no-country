export interface ProyectoAPI {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  creado: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
}

export interface CreateProyectoDTO {
  name: string;
  description: string;
}

export interface UpdateProyectoDTO {
  name: string;
  description: string;
}
