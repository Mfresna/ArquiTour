import { CategoriaObraModel } from "../obraModels/categoriaObraModel";
import { EstadoObraModel } from "../obraModels/estadoObraModel";

export interface ObraMapaModel {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion?: string;
  anioEstado?: number;
  estado?: EstadoObraModel;
  categoria?: CategoriaObraModel;
  estudioId?: number;
  urlsImagenes?: string[];
}
