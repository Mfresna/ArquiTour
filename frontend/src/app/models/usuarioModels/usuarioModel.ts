import { FavoritoBasicoModel } from "../favoritosModels/favoritoBasicoModel";

export interface UsuarioModel {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
  activo: boolean;
  fechaNacimiento: string;
  descripcion: string;
  urlImagen: string;
  idEstudios: number[];
  listaFavoritos: FavoritoBasicoModel[];
}