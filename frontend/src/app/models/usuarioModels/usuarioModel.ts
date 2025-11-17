import { FavoritoBasicoModel } from "../favoritosModels/favoritoBasicoModel";

export interface UsuarioModel {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
  fechaNacimiento: string;
  descripcion: string;
  urlImagen: string;
  idEstudios: number[];
  listaFavoritos: FavoritoBasicoModel[];
}