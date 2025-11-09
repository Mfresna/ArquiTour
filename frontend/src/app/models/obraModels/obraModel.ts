import { CategoriaObraModel } from "./categoriaObraModel";
import { EstadoObraModel } from "./estadoObraModel";

export interface ObraModel {
  id?: number;               
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  anioEstado: number;
  estado: EstadoObraModel;
  categoria: CategoriaObraModel;
  estudioId: number;
  urlsImagenes?: string[];
}