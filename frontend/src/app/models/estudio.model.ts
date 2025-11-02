// src/app/models/estudio.model.ts

/**
 * Define la estructura de un objeto Estudio devuelto por la API.
 */
export interface Estudio {
  id: number;
  nombre: string;
  obrasIds: number[];
  arquitectosIds: number[];
  imagenUrl: string | null; // Puede ser string o null
}